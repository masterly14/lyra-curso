"use server";

import { configureLemonsqueezy } from "@/config/lemonsqueezy";
import {
  createCheckout,
  getPrice,
  getProduct,
  lemonSqueezySetup,
  listPrices,
  listProducts,
  Variant,
} from "@lemonsqueezy/lemonsqueezy.js";
import { Plans, Subscription, Prisma } from "@prisma/client";
import { prisma } from "../db";
import { getUser } from "./user";
import { redirect } from "next/navigation";
import { webhookHasData, webhookHasMeta } from "../typeguards";
import { v4 as uuidv4 } from "uuid";

export async function syncPlans() {
  configureLemonsqueezy();
  const productVariants: Plans[] | undefined = await prisma.plans.findMany();

  async function _addVariant(variant: Plans) {
    console.log(`Syncing variant ${variant.name} with the database...`);

    await prisma.plans.create({
      data: {
        productId: variant.productId,
        price: variant.price,
        productName: variant.productName,
        variantId: variant.variantId,
        name: variant.name,
        description: variant.description,
        isUsageBased: variant.isUsageBased,
        interval: variant.interval,
        intervalCount: variant.intervalCount,
        trialInterval: variant.trialInterval,
        trialIntervalCount: variant.trialIntervalCount,
        sort: variant.sort,
      },
    });

    console.log(`${variant.name} synced with the database...`);
    productVariants?.push(variant);
  }

  const products = await listProducts({
    filter: { storeId: process.env.LEMONSQUEEZY_STORE_ID },
    include: ["variants"],
  });

  const allVariants = products.data?.included as Variant["data"][] | undefined;

  if (allVariants) {
    /* eslint-disable no-await-in-loop -- allow */
    for (const v of allVariants) {
      const variant = v.attributes;

      // Skip draft variants or if there's more than one variant, skip the default
      // variant. See https://docs.lemonsqueezy.com/api/variants
      if (
        variant.status === "draft" ||
        (allVariants.length !== 1 && variant.status === "pending")
      ) {
        // `return` exits the function entirely, not just the current iteration.
        // so use `continue` instead.
        continue;
      }

      // Fetch the Product name.
      const productName =
        (await getProduct(variant.product_id)).data?.data.attributes.name ?? "";

      // Fetch the Price object.
      const variantPriceObject = await listPrices({
        filter: {
          variantId: v.id,
        },
      });

      const currentPriceObj = variantPriceObject.data?.data.at(0);
      const isUsageBased =
        currentPriceObj?.attributes.usage_aggregation !== null;
      const interval = currentPriceObj?.attributes.renewal_interval_unit;
      const intervalCount =
        currentPriceObj?.attributes.renewal_interval_quantity;
      const trialInterval = currentPriceObj?.attributes.trial_interval_unit;
      const trialIntervalCount =
        currentPriceObj?.attributes.trial_interval_quantity;

      const price = isUsageBased
        ? currentPriceObj?.attributes.unit_price_decimal
        : currentPriceObj.attributes.unit_price;

      const priceString = price !== null ? price?.toString() ?? "" : "";

      const isSubscription =
        currentPriceObj?.attributes.category === "subscription";

      // If not a subscription, skip it.
      if (!isSubscription) {
        continue;
      }

      await _addVariant({
        id: v.id,
        name: variant.name,
        description: variant.description,
        price: priceString,
        interval: interval ?? "",
        intervalCount: intervalCount ?? 0,
        isUsageBased,
        productId: variant.product_id,
        productName,
        variantId: parseInt(v.id) as unknown as number,
        trialInterval: trialInterval ?? "",
        trialIntervalCount: trialIntervalCount ?? 0,
        sort: variant.sort,
        createdAt: new Date(variant.created_at),
        updatedAt: new Date(variant.updated_at),
      });
    }
  }

  return productVariants;
}

export async function getPlans() {
  configureLemonsqueezy()
  const plans = await prisma.plans.findMany({
    orderBy: {
      sort: "asc",
    },
  })

  return plans
}

export async function getCheckoutURL(variantId: number, embed: boolean) {
  configureLemonsqueezy();

  const user = await getUser();

  if (user?.status === 401) {
    redirect("/sign-in");
  }

  const checkout = await createCheckout(
    process.env.LEMONSQUEEZY_STORE_ID!,
    variantId,
    {
      checkoutOptions: {
        embed,
        media: false,
        logo: !embed,
      },
      checkoutData: {
        email: user.data?.email,
        custom: {
          user_id: user.data?.id,
        },
      },
      productOptions: {
        enabledVariants: [variantId],
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/platform/dashboard/billing/`,
        receiptButtonText: "Go to Dashboard",
        receiptThankYouNote: "Thank you for signing up to Lemon Stand!",
      },
    }
  );

  if (checkout.error) {
    throw new Error(checkout.error.message);
  }

  if (!checkout.data) {
    throw new Error("Failed to create a checkout.");
  }

  return checkout.data.data.attributes.url;
}

export async function processWebhookEvent(webhookEventId: string) {
  configureLemonsqueezy();

  const dbWebhookEvent = await prisma.webhookEvents.findUnique({
    where: {
      id: webhookEventId,
    },
    select: {
      id: true,
      eventName: true,
      processed: true,
      processingError: true,
      body: true,
    },
  });

  if (!dbWebhookEvent) {
    throw new Error(
      `Webhook event #${webhookEventId} not found in the database.`
    );
  }

  let processingError;

  const eventBody = dbWebhookEvent.body;

  if (!webhookHasMeta(eventBody)) {
    processingError = `Webhook event #${webhookEventId} has invalid metadata.`;
  } else if (webhookHasData(eventBody)) {
    if (dbWebhookEvent.eventName === "subscription_payment_") {
    } else if (
      dbWebhookEvent.eventName === "subscription_created" ||
      dbWebhookEvent.eventName === "subscription_updated"
    ) {
      const attributes = eventBody.data.attributes;

      const variantId = attributes.variant_id as number;

      const plan = await prisma.plans.findUnique({
        where: {
          variantId: variantId,
        },
      });
      if (!plan) {
        processingError = `Plan with variant ID ${variantId} not found.`;
      } else {
        const priceId = attributes.first_subscription_item.price_id;

        const priceData = await getPrice(priceId);

        if (priceData.error) {
          processingError = `Price with ID ${priceId} not found.`;
        }

        const isUsageBased = attributes.first_subscription_item.is_usage_based;

        const price = isUsageBased
          ? priceData.data?.data.attributes.unit_price_decimal
          : priceData.data?.data.attributes.unit_price;

        const subscriptionItemId = attributes.first_subscription_item.id;

        const updateData = {
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
          lemonsqueezyId: eventBody.data.id,
          orderId: typeof attributes.order_id === "string" || typeof attributes.order_id === "number"
            ? attributes.order_id.toString()
            : "",
          name: plan.name,
          email: typeof attributes.user_email === "string" ? attributes.user_email : "",
          status: typeof attributes.status === "string" ? attributes.status : "",
          statusFormatted: typeof attributes.status_formatted === "string" ? attributes.status_formatted : "",
          renewsAt: new Date(attributes.renews_at as string),
          endsAt: new Date(attributes.ends_at as string),
          trialEndsAt: new Date(attributes.trial_ends_at as string),
          price: price?.toString() ?? "",
          isPaused: false,
          subscriptionItemId: subscriptionItemId ? subscriptionItemId : Prisma.JsonNull,
          isUsageBased: attributes.first_subscription_item.is_usage_based,
          userId: eventBody.meta.custom_data.user_id,
          planId: plan.id,
        };

        try {
          await prisma.subscription.upsert({
            where: {
              lemonsqueezyId: updateData.lemonsqueezyId,
            },
            update: updateData,
            create: updateData,
          });
        } catch (error) {
            processingError = `Failed to upsert Subscription #${updateData?.lemonsqueezyId} to the database.`
          console.error(error)
        }
      }
    }

    await prisma.webhookEvents.update({
        where: {
            id: webhookEventId,
        },
        data: {
            processed: true,
            processingError: processingError ?? undefined,
        }
    })
  }
} 

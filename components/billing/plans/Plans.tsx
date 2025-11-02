import { Plans } from "@prisma/client"
import { SignupButton } from "../SignUpButton";

export function Plan({ plan }: { plan: Plans }) {
    const { description, productName, name, price } = plan
   
    return (
      <div>
        <h2>
          {productName} ({name})
        </h2>
   
        {description ? (
          <div
            dangerouslySetInnerHTML={{
              __html: description,
            }}
          ></div>
        ) : null}
   
        <p>${price}</p>
        <SignupButton plan={plan} />
    </div>
  );
}
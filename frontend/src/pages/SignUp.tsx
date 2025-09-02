// import PreSignup from "@/components/pre-signup";
import { SignupForm } from "@/components/signup-form";
import { useState } from "react";

export default function SignUp() {
  const [selectedPlan, setSelectedPlan] = useState<"team" | "solo">("team");

  // const choosePlan = (plan: "team" | "solo") => {
  //   setSelectedPlan(plan);
  // };

  return (
    <section className="flex items-center justify-center min-h-screen">
      {/* <PreSignup choosePlan={choosePlan} /> */}
      <SignupForm selectedPlan={selectedPlan} />
      {/* {selectedPlan ? <SignupForm selectedPlan={selectedPlan}/> : <PreSignup choosePlan={choosePlan} />} */}
    </section>
  );
}

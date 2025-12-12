import { KYCFlowBuilder } from "@/components/flow-builder";

export const metadata = {
  title: "Flow Builder | UNTRACED",
  description: "Build custom zero-knowledge verification flows",
};

export default function BuilderPage() {
  return <KYCFlowBuilder />;
}

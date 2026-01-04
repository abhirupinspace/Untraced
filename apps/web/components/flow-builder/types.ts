export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: "active" | "coming";
  config?: ModuleConfig;
}

export interface ModuleConfig {
  type: "threshold" | "selection" | "text";
  label: string;
  options?: string[];
  min?: number;
  max?: number;
  default?: string | number;
}

export interface FlowModule extends Module {
  instanceId: string;
  configValue?: string | number;
}

export interface Flow {
  name: string;
  description?: string;
  modules: FlowModule[];
}

export interface GeneratedCode {
  solidity: string;
  sdk: string;
  json: string;
}

// Single source of truth for supported telecom operators.
// `name` must match `platform` on Recharge_Plan documents.
export const PROVIDERS = [
    { name: "Jio", logo: "JIO.png" },
    { name: "Airtel", logo: "Airtel.png" },
    { name: "Vi", logo: "VI.png" },
];

export const PROVIDER_NAMES = PROVIDERS.map((provider) => provider.name);

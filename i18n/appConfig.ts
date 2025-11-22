type LocalePrefixMode = "always" | "as-needed" | "never";
const localePrefix: LocalePrefixMode = "as-needed";

// FIXME: Update this configuration file based on your project information
export const AppConfig = {
  name: "Croozer",
  locales: ["he", "en", "fr", "ru", "ar"],
  defaultLocale: "he",
  localePrefix,
};

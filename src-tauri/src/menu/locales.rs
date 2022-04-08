use json_gettext::{static_json_gettext_build, JSONGetText};

pub fn default() -> JSONGetText<'static> {
    let locales = static_json_gettext_build!(
        "en-US";
        "ar-AE" => "locales/ar.json",
        "ar-BH" => "locales/ar.json",
        "ar-DZ" => "locales/ar.json",
        "ar-EG" => "locales/ar.json",
        "ar-KW" => "locales/ar.json",
        "ar-IQ" => "locales/ar.json",
        "ar-JO" => "locales/ar.json",
        "ar-LB" => "locales/ar.json",
        "ar-MA" => "locales/ar.json",
        "ar-OM" => "locales/ar.json",
        "ar-QA" => "locales/ar.json",
        "ar-SA" => "locales/ar.json",
        "ar-TN" => "locales/ar.json",
        "ar-YE" => "locales/ar.json",
        "cs-CZ" => "locales/cs.json",
        "de-AT" => "locales/de.json",
        "de-CH" => "locales/de.json",
        "de-DE" => "locales/de.json",
        "de-LI" => "Locales/de.json",
        "de-LU" => "Locales/de.json",
        "en-GB" => "locales/en.json",
        "en-US" => "locales/en.json",
        "es-AR" => "locales/es.json",
        "es-BO" => "locales/es.json",
        "es-CL" => "locales/es.json",
        "es-CO" => "locales/es.json",
        "es-CR" => "locales/es.json",
        "es-DO" => "locales/es.json",
        "es-EC" => "locales/es.json",
        "es-ES" => "locales/es.json",
        "es-GT" => "locales/es.json",
        "es-HN" => "locales/es.json",
        "es-MX" => "locales/es.json",
        "es-NI" => "locales/es.json",
        "es-PA" => "locales/es.json",
        "es-PE" => "locales/es.json",
        "es-PR" => "locales/es.json",
        "es-PY" => "locales/es.json",
        "es-SV" => "locales/es.json",
        "es-US" => "locales/es.json",
        "es-UY" => "locales/es.json",
        "es-VE" => "locales/es.json",
        "hu-HU" => "locales/hu.json",
        "ja-JP" => "locales/ja.json",
        "pl-PL" => "locales/pl.json",
        "pt-BR" => "locales/pt.json",
        "pt-PT" => "locales/pt.json",
        "ru-RU" => "locales/ru.json",
        "zh-CN" => "locales/zh_CN.json",
        "zh-TW" => "locales/zh_TW.json"
    )
    .unwrap();

    locales
}

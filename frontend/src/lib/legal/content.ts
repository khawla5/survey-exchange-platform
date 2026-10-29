export type LegalSection = {
  title: string;
  body: string[];
};

export type LegalDoc = {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

export const termsContent: Record<"en" | "ar", LegalDoc> = {
  en: {
    title: "Terms of Service",
    updated: "Last updated: October 29, 2026",
    intro:
      "These Terms of Service (\"Terms\") govern your access to and use of SurveyXchange (the \"Platform\"), operated as a survey-exchange ecosystem for students, researchers, faculty members and universities. By creating an account or using the Platform, you agree to these Terms.",
    sections: [
      {
        title: "1. The Service",
        body: [
          "SurveyXchange lets members earn points by completing surveys published by other members, and spend those points to publish their own surveys and collect responses from other members.",
          "Surveys themselves are hosted on third-party form tools (for example Google Forms) that you link to from SurveyXchange. The Platform only tracks participation (publishing, views, clicks and completion confirmations) for the purpose of awarding and deducting points — it does not collect or store the answers you submit on those external forms.",
        ],
      },
      {
        title: "2. Eligibility and your account",
        body: [
          "You must provide accurate information when registering, including a valid email address that you control, and keep your password confidential. You are responsible for all activity under your account.",
          "The Platform is intended for students, researchers, faculty and institutional staff. You confirm that the academic information you provide (academic level, institution) is accurate to the best of your knowledge.",
          "We verify new accounts with a one-time code sent to your email. You must not share this code with anyone or use another person's email address to register.",
        ],
      },
      {
        title: "3. Points are not currency",
        body: [
          "Points earned or spent on SurveyXchange have no monetary value, cannot be exchanged for cash, cannot be transferred between accounts, and cannot be purchased. Points exist solely to balance participation inside the Platform (answering surveys earns points; publishing a survey costs points).",
          "We may adjust point balances to correct errors, reverse fraudulent activity, or enforce these Terms.",
        ],
      },
      {
        title: "4. Acceptable use",
        body: [
          "When publishing a survey or interacting with the Platform you agree not to: submit false completion confirmations; publish surveys that collect sensitive personal data, are deceptive, unlawful, or unrelated to legitimate academic or research purposes; attempt to manipulate the points or leaderboard system; impersonate another person or institution; or interfere with the Platform's security or availability.",
          "We may remove any survey, suspend points, or restrict an account that violates this section, with or without prior notice, depending on severity.",
        ],
      },
      {
        title: "5. Institution verification",
        body: [
          "Institutions may request a verified badge on their profile. We may request supporting evidence of affiliation and may revoke verification at any time if we find the information to be inaccurate.",
        ],
      },
      {
        title: "6. Intellectual property",
        body: [
          "The Platform's branding, design, code and content (excluding survey content you create or link to) belong to SurveyXchange. You retain ownership of the survey content you create; by publishing on the Platform you grant us a limited license to display it to other members for the purpose of operating the exchange.",
        ],
      },
      {
        title: "7. Suspension and termination",
        body: [
          "You may stop using the Platform and request deletion of your account at any time. We may suspend or terminate accounts that violate these Terms, engage in fraudulent point activity, or pose a security risk to the Platform or its members.",
        ],
      },
      {
        title: "8. Disclaimers and limitation of liability",
        body: [
          "The Platform is provided \"as is\". We do not guarantee that surveys published by members are accurate, lawful, or fit for any particular research purpose, and we are not a party to any agreement between members regarding survey responses.",
          "To the maximum extent permitted by law, SurveyXchange is not liable for indirect, incidental or consequential damages arising from your use of the Platform or of third-party form tools linked from it.",
        ],
      },
      {
        title: "9. Changes to these Terms",
        body: [
          "We may update these Terms from time to time. Material changes will be announced on the Platform or by email before they take effect. Continuing to use the Platform after changes take effect constitutes acceptance of the updated Terms.",
        ],
      },
      {
        title: "10. Contact",
        body: ["Questions about these Terms can be sent to support@pollxchange.com."],
      },
    ],
  },
  ar: {
    title: "شروط الاستخدام",
    updated: "آخر تحديث: 29 أكتوبر 2026",
    intro:
      'توضّح شروط الاستخدام هذه ("الشروط") القواعد التي تحكم وصولك إلى منصة "SurveyXchange" واستخدامك لها، وهي منصة لتبادل إجابات الاستبيانات بين الطلاب والباحثين وأعضاء هيئة التدريس والجامعات. بإنشائك حسابًا أو استخدامك للمنصة فإنك توافق على هذه الشروط.',
    sections: [
      {
        title: "1. الخدمة المقدَّمة",
        body: [
          "تتيح SurveyXchange للأعضاء كسب نقاط عند الإجابة على استبيانات نشرها أعضاء آخرون، وإنفاق تلك النقاط لنشر استبياناتهم الخاصة وجمع إجابات من أعضاء آخرين.",
          "تُستضاف الاستبيانات نفسها على أدوات نماذج خارجية (مثل Google Forms) تقوم بربطها من داخل المنصة. تقتصر مهمة SurveyXchange على تتبع المشاركة (النشر، المشاهدات، النقرات، وتأكيدات الإكمال) لغرض احتساب النقاط فقط — ولا تجمع المنصة أو تخزّن إجاباتك الفعلية التي تقدّمها على تلك النماذج الخارجية.",
        ],
      },
      {
        title: "2. الأهلية وحسابك",
        body: [
          "يجب تقديم معلومات دقيقة عند التسجيل، بما في ذلك بريد إلكتروني صالح تملك حق الوصول إليه، والحفاظ على سرية كلمة المرور الخاصة بك. أنت المسؤول عن جميع الأنشطة التي تتم من خلال حسابك.",
          "المنصة موجّهة للطلاب والباحثين وأعضاء هيئة التدريس والعاملين في المؤسسات الأكاديمية. بتسجيلك فإنك تقرّ بأن المعلومات الأكاديمية التي تقدّمها (المستوى الأكاديمي، المؤسسة) صحيحة بحسب علمك.",
          "نقوم بالتحقق من الحسابات الجديدة عبر رمز لمرة واحدة يُرسل إلى بريدك الإلكتروني. يُمنع مشاركة هذا الرمز مع أي شخص آخر أو استخدام بريد إلكتروني لا تملكه للتسجيل.",
        ],
      },
      {
        title: "3. النقاط ليست عملة",
        body: [
          "ليس للنقاط المكتسبة أو المنفقة على SurveyXchange أي قيمة نقدية، ولا يمكن استبدالها بأموال نقدية، ولا تحويلها بين الحسابات، ولا شراؤها. وجود النقاط هو فقط لتنظيم المشاركة داخل المنصة (الإجابة على استبيان تمنحك نقاطًا؛ ونشر استبيان يكلّفك نقاطًا).",
          "يحق لنا تعديل أرصدة النقاط لتصحيح أخطاء، أو لإبطال نشاط احتيالي، أو لتطبيق هذه الشروط.",
        ],
      },
      {
        title: "4. الاستخدام المقبول",
        body: [
          "عند نشر استبيان أو التفاعل مع المنصة، توافق على عدم: تقديم تأكيدات إكمال وهمية؛ نشر استبيانات تجمع بيانات شخصية حساسة أو تكون مضلِّلة أو مخالفة للقانون أو غير مرتبطة بغرض أكاديمي أو بحثي مشروع؛ محاولة التلاعب بنظام النقاط أو لوحة المتصدرين؛ انتحال شخصية فرد أو مؤسسة أخرى؛ أو الإضرار بأمان المنصة أو توافرها.",
          "يحق لنا إزالة أي استبيان، أو تجميد النقاط، أو تقييد أي حساب يخالف هذا البند، بإشعار مسبق أو دونه بحسب جسامة المخالفة.",
        ],
      },
      {
        title: "5. توثيق المؤسسات",
        body: [
          "يمكن للمؤسسات طلب شارة توثيق على ملفها. قد نطلب إثباتات داعمة للانتماء، ويحق لنا سحب التوثيق في أي وقت إذا تبيّن لنا عدم دقة المعلومات المقدَّمة.",
        ],
      },
      {
        title: "6. الملكية الفكرية",
        body: [
          "تظل هوية المنصة وتصميمها وشيفرتها البرمجية ومحتواها (باستثناء محتوى الاستبيانات التي تنشئها أو تربطها) ملكًا لـ SurveyXchange. تحتفظ أنت بملكية محتوى الاستبيانات التي تنشئها؛ وبنشرها على المنصة فإنك تمنحنا ترخيصًا محدودًا لعرضها على الأعضاء الآخرين بغرض تشغيل عملية التبادل.",
        ],
      },
      {
        title: "7. تعليق الحساب وإنهاؤه",
        body: [
          "يمكنك التوقف عن استخدام المنصة وطلب حذف حسابك في أي وقت. يحق لنا تعليق أو إنهاء أي حساب يخالف هذه الشروط، أو يمارس نشاطًا احتياليًا بالنقاط، أو يشكّل خطرًا أمنيًا على المنصة أو أعضائها.",
        ],
      },
      {
        title: "8. إخلاء المسؤولية وحدود المسؤولية",
        body: [
          'تُقدَّم المنصة "كما هي". لا نضمن دقة أو مشروعية أو ملاءمة الاستبيانات التي ينشرها الأعضاء لأي غرض بحثي معيّن، ولسنا طرفًا في أي اتفاق بين الأعضاء بخصوص إجابات الاستبيانات.',
          "وإلى أقصى حد يسمح به القانون، لا تتحمّل SurveyXchange مسؤولية الأضرار غير المباشرة أو العرضية أو التبعية الناشئة عن استخدامك للمنصة أو لأدوات النماذج الخارجية المرتبطة بها.",
        ],
      },
      {
        title: "9. التعديلات على هذه الشروط",
        body: [
          "قد نقوم بتحديث هذه الشروط من وقت لآخر. سيُعلَن عن أي تعديل جوهري عبر المنصة أو بالبريد الإلكتروني قبل سريانه. استمرارك باستخدام المنصة بعد سريان التعديلات يُعدّ قبولًا بالشروط المحدَّثة.",
        ],
      },
      {
        title: "10. التواصل معنا",
        body: ["لأي استفسار بخصوص هذه الشروط يمكنكم التواصل عبر support@pollxchange.com."],
      },
    ],
  },
};

export const privacyContent: Record<"en" | "ar", LegalDoc> = {
  en: {
    title: "Privacy Policy",
    updated: "Last updated: October 29, 2026",
    intro:
      "This Privacy Policy explains what information SurveyXchange collects when you use the Platform, how we use it, who we share it with, and the choices available to you.",
    sections: [
      {
        title: "1. Information we collect",
        body: [
          "Account information: first and last name, email address, hashed password, academic level and institution name (where you choose to provide them).",
          "Usage information: surveys you publish, survey-participation and completion confirmations, points balance and transaction history, achievements unlocked, and reports you submit.",
          "Technical information: IP address, device and browser information, and authentication cookies required to keep you signed in.",
          "We do not collect the actual answers you submit on third-party survey forms, and we do not collect payment card information — the Platform does not process real-money payments.",
        ],
      },
      {
        title: "2. How we use your information",
        body: [
          "To create and secure your account, including sending a one-time verification code to your email.",
          "To operate the points economy: crediting points for completed surveys, debiting points for published surveys, and displaying your standing on the leaderboard (based on the display name you choose to show).",
          "To send you transactional emails (verification codes, notifications about your surveys or account) and, where applicable, real-time in-app notifications.",
          "To detect and prevent fraud, abuse of the points system, and violations of our Terms of Service.",
        ],
      },
      {
        title: "3. Cookies",
        body: [
          "We use essential cookies to keep you signed in (short-lived access token and longer-lived refresh token, stored as httpOnly cookies). These cookies are required for the Platform to function and are not used for advertising or cross-site tracking.",
        ],
      },
      {
        title: "4. Who we share data with",
        body: [
          "We share data only with the service providers that help us run the Platform: our database host for storing account and platform data, and our email provider for sending verification codes and notifications. These providers process data on our behalf and are not permitted to use it for their own purposes.",
          "We do not sell your personal information, and we do not share it with third parties for their own marketing purposes.",
          "We may disclose information if required by law or to protect the rights, safety or security of SurveyXchange, its members, or the public.",
        ],
      },
      {
        title: "5. Data retention",
        body: [
          "We retain account and usage data for as long as your account is active. If you delete your account, we delete or anonymize your personal information within a reasonable period, except where we are required to retain certain records by law or to resolve disputes.",
        ],
      },
      {
        title: "6. Data security",
        body: [
          "Passwords are stored using one-way hashing and are never stored or transmitted in plain text. Data is transmitted over encrypted (HTTPS) connections, and access to production systems is restricted. No method of transmission or storage is perfectly secure, and we cannot guarantee absolute security.",
        ],
      },
      {
        title: "7. Your rights",
        body: [
          "You may access, correct, or request deletion of your personal information at any time by contacting us, or by using the available account settings on the Platform. You may also request a copy of the data associated with your account.",
        ],
      },
      {
        title: "8. Children's privacy",
        body: [
          "The Platform is intended for university-affiliated students, researchers and staff, and is not directed at children under 16. We do not knowingly collect personal information from children under 16.",
        ],
      },
      {
        title: "9. Changes to this policy",
        body: [
          "We may update this Privacy Policy from time to time. Material changes will be announced on the Platform or by email before they take effect.",
        ],
      },
      {
        title: "10. Contact",
        body: ["Questions about this Privacy Policy can be sent to support@pollxchange.com."],
      },
    ],
  },
  ar: {
    title: "سياسة الخصوصية",
    updated: "آخر تحديث: 29 أكتوبر 2026",
    intro:
      "توضّح سياسة الخصوصية هذه نوع المعلومات التي تجمعها SurveyXchange عند استخدامك للمنصة، وكيفية استخدامها، والجهات التي نشاركها معها، والخيارات المتاحة لك.",
    sections: [
      {
        title: "1. المعلومات التي نجمعها",
        body: [
          "معلومات الحساب: الاسم الأول والأخير، البريد الإلكتروني، كلمة المرور بعد تشفيرها، المستوى الأكاديمي واسم المؤسسة (عند اختيارك تقديمها).",
          "معلومات الاستخدام: الاستبيانات التي تنشرها، بيانات المشاركة وتأكيدات الإكمال، رصيد النقاط وسجل الحركات، الإنجازات التي تحققها، والبلاغات التي ترسلها.",
          "معلومات تقنية: عنوان IP، معلومات الجهاز والمتصفح، وملفات تعريف الارتباط (الكوكيز) الخاصة بالمصادقة واللازمة لإبقائك مسجّلًا للدخول.",
          "لا نجمع الإجابات الفعلية التي تقدّمها على نماذج الاستبيانات الخارجية، ولا نجمع بيانات بطاقات الدفع — المنصة لا تعالج أي مدفوعات نقدية حقيقية.",
        ],
      },
      {
        title: "2. كيف نستخدم معلوماتك",
        body: [
          "لإنشاء حسابك وتأمينه، بما في ذلك إرسال رمز تحقق لمرة واحدة إلى بريدك الإلكتروني.",
          "لتشغيل اقتصاد النقاط: إضافة نقاط عند إكمال استبيان، وخصم نقاط عند نشر استبيان، وعرض ترتيبك في لوحة المتصدرين (بالاسم الذي تختار إظهاره).",
          "لإرسال رسائل بريد إلكتروني تشغيلية (رموز التحقق، إشعارات متعلقة باستبياناتك أو حسابك)، وعند الإمكان إشعارات فورية داخل المنصة.",
          "للكشف عن الاحتيال أو إساءة استخدام نظام النقاط ومنعهما، ولرصد مخالفات شروط الاستخدام.",
        ],
      },
      {
        title: "3. ملفات تعريف الارتباط (الكوكيز)",
        body: [
          "نستخدم كوكيز أساسية لإبقائك مسجّلًا للدخول (رمز وصول قصير المدة ورمز تجديد أطول مدة، مخزَّنين كـ httpOnly cookies). هذه الكوكيز ضرورية لعمل المنصة ولا تُستخدم لأغراض إعلانية أو لتتبعك عبر مواقع أخرى.",
        ],
      },
      {
        title: "4. مع من نشارك بياناتك",
        body: [
          "نشارك البيانات فقط مع مزوّدي الخدمة الذين يساعدوننا في تشغيل المنصة: مضيف قاعدة البيانات لتخزين بيانات الحساب والمنصة، ومزوّد البريد الإلكتروني لإرسال رموز التحقق والإشعارات. يعالج هؤلاء المزوّدون البيانات نيابة عنّا ولا يُسمح لهم باستخدامها لأغراضهم الخاصة.",
          "نحن لا نبيع معلوماتك الشخصية، ولا نشاركها مع أطراف ثالثة لأغراضهم التسويقية الخاصة.",
          "قد نفصح عن معلومات إذا تطلّب ذلك القانون، أو لحماية حقوق وسلامة وأمن SurveyXchange أو أعضائها أو الجمهور.",
        ],
      },
      {
        title: "5. مدة الاحتفاظ بالبيانات",
        body: [
          "نحتفظ ببيانات الحساب والاستخدام طالما كان حسابك نشِطًا. عند حذف حسابك، نقوم بحذف معلوماتك الشخصية أو إخفاء هويتها خلال مدة معقولة، إلا في الحالات التي يفرض فيها القانون الاحتفاظ بسجلات معيّنة أو لحل نزاعات قائمة.",
        ],
      },
      {
        title: "6. أمان البيانات",
        body: [
          "تُخزَّن كلمات المرور بصيغة مشفّرة أحادية الاتجاه ولا تُخزَّن أو تُنقل أبدًا كنص صريح. تُنقل البيانات عبر اتصالات مشفّرة (HTTPS)، والوصول إلى أنظمة الإنتاج مقيَّد. لا توجد وسيلة نقل أو تخزين آمنة بشكل مطلق، ولا يمكننا ضمان أمان تام.",
        ],
      },
      {
        title: "7. حقوقك",
        body: [
          "يمكنك الوصول إلى معلوماتك الشخصية أو تصحيحها أو طلب حذفها في أي وقت بالتواصل معنا، أو عبر إعدادات الحساب المتاحة على المنصة. كما يمكنك طلب نسخة من البيانات المرتبطة بحسابك.",
        ],
      },
      {
        title: "8. خصوصية القاصرين",
        body: [
          "المنصة موجّهة للطلاب والباحثين والعاملين المرتبطين بمؤسسات أكاديمية، وليست موجّهة للأطفال دون سن 16 عامًا. نحن لا نجمع عمدًا معلومات شخصية من أطفال دون هذا السن.",
        ],
      },
      {
        title: "9. التعديلات على هذه السياسة",
        body: [
          "قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سيُعلَن عن أي تعديل جوهري عبر المنصة أو بالبريد الإلكتروني قبل سريانه.",
        ],
      },
      {
        title: "10. التواصل معنا",
        body: ["لأي استفسار بخصوص سياسة الخصوصية يمكنكم التواصل عبر support@pollxchange.com."],
      },
    ],
  },
};

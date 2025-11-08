import { Language } from "../types";

/**
 * MULTILINGUAL ENGAGEMENT MESSAGES
 * Daily study reminders, greetings, task reminders, and motivational messages
 * Supports all 14 languages in Studentopia
 */

// Daily Study Reminder Messages (20 messages for daily rotation)
const DAILY_STUDY_REMINDERS: Record<Language, string[]> = {
  en: [
    "Ready to focus and grow today?",
    "A few mindful minutes can lead to amazing progress.",
    "Your Studentopia Companion believes in you — let's begin!",
    "Small steps, steady focus, big results.",
    "Take a deep breath — it's time to learn with calm and clarity.",
    "Every bit of effort today moves you closer to your goals.",
    "Your study journey starts now — one task at a time.",
    "{companionName}'s cheering you on — let's make today count!",
    "Breathe in focus, breathe out distraction.",
    "You've got this — your future self will thank you.",
    "Focus is your superpower today.",
    "Stay curious — learning something new starts with one page.",
    "Your Studentopia friend is proud of your effort.",
    "Let's make today's study time count!",
    "It's a great day to learn something inspiring.",
    "Consistency creates confidence — one session at a time.",
    "Take a deep breath, find your rhythm, and begin.",
    "You're doing better than you think — keep going!",
    "Your mind is ready. Let's study with calm focus.",
    "Learning today builds the tomorrow you imagine.",
  ],
  es: [
    "¿Listo para concentrarte y crecer hoy?",
    "Unos minutos conscientes pueden llevar a un progreso increíble.",
    "Tu compañero Studentopia cree en ti: ¡comencemos!",
    "Pasos pequeños, enfoque constante, grandes resultados.",
    "Respira profundo: es hora de aprender con calma y claridad.",
    "Cada bit de esfuerzo hoy te acerca a tus objetivos.",
    "Tu viaje de estudio comienza ahora, una tarea a la vez.",
    "¡{companionName} te anima! ¡Hagamos que hoy cuente!",
    "Respira enfoque, exhala distracción.",
    "Tú puedes: tu yo futuro te lo agradecerá.",
    "El enfoque es tu superpoder hoy.",
    "Mantente curioso: aprender algo nuevo comienza con una página.",
    "Tu amigo Studentopia está orgulloso de tu esfuerzo.",
    "¡Hagamos que el tiempo de estudio de hoy cuente!",
    "Es un gran día para aprender algo inspirador.",
    "La consistencia crea confianza, una sesión a la vez.",
    "Respira profundo, encuentra tu ritmo y comienza.",
    "Estás haciendo mejor de lo que piensas: ¡sigue así!",
    "Tu mente está lista. Estudiemos con enfoque tranquilo.",
    "Aprender hoy construye el mañana que imaginas.",
  ],
  fr: [
    "Prêt à vous concentrer et à progresser aujourd'hui?",
    "Quelques minutes conscientes peuvent mener à des progrès incroyables.",
    "Votre compagnon Studentopia croit en vous — commençons!",
    "Petits pas, concentration constante, grands résultats.",
    "Respirez profondément — il est temps d'apprendre avec calme et clarté.",
    "Chaque effort d'aujourd'hui vous rapproche de vos objectifs.",
    "Votre parcours d'étude commence maintenant, une tâche à la fois.",
    "{companionName} vous encourage — faisons que aujourd'hui compte!",
    "Inspirez la concentration, expirez la distraction.",
    "Vous pouvez le faire — votre futur vous remerciera.",
    "La concentration est votre superpouvoir aujourd'hui.",
    "Restez curieux — apprendre quelque chose de nouveau commence par une page.",
    "Votre ami Studentopia est fier de vos efforts.",
    "Faisons que le temps d'étude d'aujourd'hui compte!",
    "C'est un bon jour pour apprendre quelque chose d'inspirant.",
    "La cohérence crée la confiance, une session à la fois.",
    "Respirez profondément, trouvez votre rythme et commencez.",
    "Vous faites mieux que vous ne le pensez — continuez!",
    "Votre esprit est prêt. Étudions avec une concentration calme.",
    "Apprendre aujourd'hui construit le demain que vous imaginez.",
  ],
  de: [
    "Bereit, dich heute zu konzentrieren und zu wachsen?",
    "Ein paar achtsame Minuten können zu erstaunlichem Fortschritt führen.",
    "Dein Studentopia-Begleiter glaubt an dich — lass uns beginnen!",
    "Kleine Schritte, stetiger Fokus, große Ergebnisse.",
    "Atme tief durch — es ist Zeit, mit Ruhe und Klarheit zu lernen.",
    "Jede Anstrengung heute bringt dich deinen Zielen näher.",
    "Deine Lernreise beginnt jetzt — eine Aufgabe nach der anderen.",
    "{companionName} feuert dich an — lass uns heute zählen!",
    "Fokus einatmen, Ablenkung ausatmen.",
    "Du schaffst das — dein zukünftiges Ich wird dir danken.",
    "Fokus ist heute deine Superkraft.",
    "Bleib neugierig — etwas Neues zu lernen beginnt mit einer Seite.",
    "Dein Studentopia-Freund ist stolz auf deine Bemühungen.",
    "Lass uns die heutige Lernzeit zählen!",
    "Es ist ein großartiger Tag, um etwas Inspirierendes zu lernen.",
    "Beständigkeit schafft Selbstvertrauen — eine Sitzung nach der anderen.",
    "Atme tief durch, finde deinen Rhythmus und beginne.",
    "Du machst es besser, als du denkst — mach weiter!",
    "Dein Geist ist bereit. Lass uns mit ruhigem Fokus lernen.",
    "Heute lernen baut das Morgen, das du dir vorstellst.",
  ],
  zh: [
    "准备好今天专注和成长了吗？",
    "几分钟的正念可以带来惊人的进步。",
    "你的Studentopia伙伴相信你——让我们开始吧！",
    "小步前进，稳定专注，大成果。",
    "深呼吸——是时候以平静和清晰的心态学习了。",
    "今天的每一份努力都让你更接近目标。",
    "你的学习之旅现在开始——一次一项任务。",
    "{companionName}在为你加油——让今天有意义！",
    "吸入专注，呼出分心。",
    "你能做到——未来的你会感谢你。",
    "专注是你今天的超能力。",
    "保持好奇——学习新东西从一页开始。",
    "你的Studentopia朋友为你的努力感到骄傲。",
    "让今天的学习时间有价值！",
    "今天是学习启发性内容的好日子。",
    "坚持创造信心——一次一个学习会话。",
    "深呼吸，找到你的节奏，然后开始。",
    "你做得比你想象的要好——继续前进！",
    "你的大脑已准备好。让我们以平静的专注学习。",
    "今天学习构建你想象的明天。",
  ],
  ja: [
    "今日は集中して成長する準備はできていますか？",
    "数分のマインドフルネスが素晴らしい進歩につながります。",
    "あなたのStudentopia仲間があなたを信じています — 始めましょう！",
    "小さな一歩、着実な集中、大きな結果。",
    "深呼吸して — 落ち着いて明確に学ぶ時間です。",
    "今日のすべての努力があなたを目標に近づけます。",
    "あなたの学習の旅は今始まります — 1つずつタスクをこなしましょう。",
    "{companionName}があなたを応援しています — 今日を意味あるものにしましょう！",
    "集中を吸い込み、気を散らすものを吐き出す。",
    "あなたならできます — 未来のあなたが感謝します。",
    "集中は今日のあなたのスーパーパワーです。",
    "好奇心を持ち続けて — 新しいことを学ぶのは1ページから始まります。",
    "あなたのStudentopiaの友達はあなたの努力を誇りに思っています。",
    "今日の勉強時間を価値あるものにしましょう！",
    "今日は刺激的なことを学ぶ素晴らしい日です。",
    "一貫性が自信を生む — 1セッションずつ。",
    "深呼吸して、リズムを見つけて、始めましょう。",
    "あなたは思っているよりうまくやっています — 続けましょう！",
    "あなたの心は準備ができています。落ち着いた集中で勉強しましょう。",
    "今日学ぶことがあなたが想像する明日を作ります。",
  ],
  ar: [
    "هل أنت مستعد للتركيز والنمو اليوم؟",
    "بضع دقائق واعية يمكن أن تؤدي إلى تقدم مذهل.",
    "رفيقك في Studentopia يؤمن بك — لنبدأ!",
    "خطوات صغيرة، تركيز ثابت، نتائج كبيرة.",
    "خذ نفسًا عميقًا — حان وقت التعلم بهدوء ووضوح.",
    "كل جهد اليوم يقربك من أهدافك.",
    "رحلتك الدراسية تبدأ الآن — مهمة واحدة في كل مرة.",
    "{companionName} يشجعك — لنجعل اليوم يعد!",
    "استنشق التركيز، اطرد التشتت.",
    "أنت قادر على ذلك — ذاتك المستقبلية ستشكرك.",
    "التركيز هو قوتك الخارقة اليوم.",
    "ابق فضوليًا — تعلم شيء جديد يبدأ بصفحة واحدة.",
    "صديقك في Studentopia فخور بجهدك.",
    "لنجعل وقت الدراسة اليوم يعد!",
    "إنه يوم رائع لتعلم شيء ملهم.",
    "الاتساق يخلق الثقة — جلسة واحدة في كل مرة.",
    "خذ نفسًا عميقًا، اعثر على إيقاعك، وابدأ.",
    "أنت تفعل أفضل مما تعتقد — استمر!",
    "عقلك جاهز. لندرس بتركيز هادئ.",
    "التعلم اليوم يبني الغد الذي تتخيله.",
  ],
  ko: [
    "오늘 집중하고 성장할 준비가 되셨나요?",
    "몇 분의 마음챙김이 놀라운 진전으로 이어질 수 있습니다.",
    "당신의 Studentopia 동반자가 당신을 믿습니다 — 시작합시다!",
    "작은 걸음, 꾸준한 집중, 큰 결과.",
    "깊은 숨을 쉬세요 — 차분하고 명확하게 배울 시간입니다.",
    "오늘의 모든 노력이 당신을 목표에 더 가깝게 만듭니다.",
    "당신의 학습 여정은 지금 시작됩니다 — 한 번에 하나씩.",
    "{companionName}이 당신을 응원합니다 — 오늘을 의미있게 만들어요!",
    "집중을 들이마시고, 산만함을 내쉬세요.",
    "당신은 할 수 있습니다 — 미래의 당신이 감사할 것입니다.",
    "집중은 오늘 당신의 초능력입니다.",
    "호기심을 유지하세요 — 새로운 것을 배우는 것은 한 페이지부터 시작됩니다.",
    "당신의 Studentopia 친구는 당신의 노력을 자랑스럽게 생각합니다.",
    "오늘의 학습 시간을 가치있게 만들어요!",
    "오늘은 영감을 주는 것을 배우기에 좋은 날입니다.",
    "일관성이 자신감을 만듭니다 — 한 번에 하나의 세션.",
    "깊은 숨을 쉬고, 리듬을 찾고, 시작하세요.",
    "당신은 생각보다 잘하고 있습니다 — 계속하세요!",
    "당신의 마음은 준비되었습니다. 차분한 집중으로 공부합시다.",
    "오늘 배우는 것이 당신이 상상하는 내일을 만듭니다.",
  ],
  pt: [
    "Pronto para se concentrar e crescer hoje?",
    "Alguns minutos conscientes podem levar a um progresso incrível.",
    "Seu companheiro Studentopia acredita em você — vamos começar!",
    "Pequenos passos, foco constante, grandes resultados.",
    "Respire fundo — é hora de aprender com calma e clareza.",
    "Cada esforço hoje te aproxima dos seus objetivos.",
    "Sua jornada de estudo começa agora — uma tarefa de cada vez.",
    "{companionName} está torcendo por você — vamos fazer hoje valer a pena!",
    "Inspire o foco, expire a distração.",
    "Você consegue — seu eu futuro vai agradecer.",
    "Foco é seu superpoder hoje.",
    "Permaneça curioso — aprender algo novo começa com uma página.",
    "Seu amigo Studentopia está orgulhoso do seu esforço.",
    "Vamos fazer o tempo de estudo de hoje valer a pena!",
    "É um ótimo dia para aprender algo inspirador.",
    "A consistência cria confiança — uma sessão de cada vez.",
    "Respire fundo, encontre seu ritmo e comece.",
    "Você está indo melhor do que pensa — continue!",
    "Sua mente está pronta. Vamos estudar com foco calmo.",
    "Aprender hoje constrói o amanhã que você imagina.",
  ],
  hi: [
    "आज ध्यान केंद्रित करने और बढ़ने के लिए तैयार हैं?",
    "कुछ सचेत मिनट अद्भुत प्रगति की ओर ले जा सकते हैं।",
    "आपका Studentopia साथी आप पर विश्वास करता है — चलिए शुरू करें!",
    "छोटे कदम, स्थिर फोकस, बड़े परिणाम।",
    "गहरी सांस लें — शांति और स्पष्टता के साथ सीखने का समय है।",
    "आज का हर प्रयास आपको अपने लक्ष्यों के करीब ले जाता है।",
    "आपकी अध्ययन यात्रा अभी शुरू होती है — एक बार में एक कार्य।",
    "{companionName} आपका उत्साहवर्धन कर रहा है — आइए आज को मायने रखें!",
    "फोकस को अंदर लें, विकर्षण को बाहर करें।",
    "आप यह कर सकते हैं — आपका भविष्य का स्व आपको धन्यवाद देगा।",
    "फोकस आज आपकी महाशक्ति है।",
    "जिज्ञासु बने रहें — कुछ नया सीखना एक पृष्ठ से शुरू होता है।",
    "आपका Studentopia मित्र आपके प्रयास पर गर्व करता है।",
    "आइए आज के अध्ययन समय को मायने रखें!",
    "आज कुछ प्रेरणादायक सीखने के लिए एक शानदार दिन है।",
    "निरंतरता आत्मविश्वास पैदा करती है — एक बार में एक सत्र।",
    "गहरी सांस लें, अपनी लय खोजें, और शुरू करें।",
    "आप सोचते हैं उससे बेहतर कर रहे हैं — जारी रखें!",
    "आपका मन तैयार है। शांत फोकस के साथ अध्ययन करें।",
    "आज सीखना वह कल बनाता है जिसकी आप कल्पना करते हैं।",
  ],
  it: [
    "Pronto a concentrarti e crescere oggi?",
    "Pochi minuti consapevoli possono portare a progressi sorprendenti.",
    "Il tuo compagno Studentopia crede in te — iniziamo!",
    "Piccoli passi, focus costante, grandi risultati.",
    "Fai un respiro profondo — è ora di imparare con calma e chiarezza.",
    "Ogni sforzo di oggi ti avvicina ai tuoi obiettivi.",
    "Il tuo viaggio di studio inizia ora — un compito alla volta.",
    "{companionName} ti fa il tifo — facciamo contare oggi!",
    "Inspira il focus, espira la distrazione.",
    "Ce la puoi fare — il tuo io futuro ti ringrazierà.",
    "Il focus è il tuo superpotere oggi.",
    "Rimani curioso — imparare qualcosa di nuovo inizia con una pagina.",
    "Il tuo amico Studentopia è orgoglioso del tuo sforzo.",
    "Facciamo contare il tempo di studio di oggi!",
    "È un ottimo giorno per imparare qualcosa di ispirante.",
    "La coerenza crea fiducia — una sessione alla volta.",
    "Fai un respiro profondo, trova il tuo ritmo e inizia.",
    "Stai andando meglio di quanto pensi — continua!",
    "La tua mente è pronta. Studiamo con un focus calmo.",
    "Imparare oggi costruisce il domani che immagini.",
  ],
  tr: [
    "Bugün odaklanmaya ve gelişmeye hazır mısınız?",
    "Birkaç bilinçli dakika inanılmaz ilerlemeye yol açabilir.",
    "Studentopia arkadaşınız size inanıyor — başlayalım!",
    "Küçük adımlar, istikrarlı odaklanma, büyük sonuçlar.",
    "Derin bir nefes alın — sakinlik ve netlikle öğrenme zamanı.",
    "Bugünkü her çaba sizi hedeflerinize yaklaştırıyor.",
    "Çalışma yolculuğunuz şimdi başlıyor — bir seferde bir görev.",
    "{companionName} sizi destekliyor — bugünü önemli kılalım!",
    "Odaklanmayı içe çekin, dikkati dağıtan şeyleri dışarı verin.",
    "Bunu yapabilirsiniz — gelecekteki benliğiniz size teşekkür edecek.",
    "Odaklanma bugün süper gücünüz.",
    "Meraklı kalın — yeni bir şey öğrenmek bir sayfayla başlar.",
    "Studentopia arkadaşınız çabanızla gurur duyuyor.",
    "Bugünkü çalışma zamanını değerli kılalım!",
    "Bugün ilham verici bir şeyler öğrenmek için harika bir gün.",
    "Tutarlılık güven yaratır — bir seferde bir oturum.",
    "Derin bir nefes alın, ritminizi bulun ve başlayın.",
    "Düşündüğünüzden daha iyi yapıyorsunuz — devam edin!",
    "Zihniniz hazır. Sakin bir odakla çalışalım.",
    "Bugün öğrenmek hayal ettiğiniz yarını inşa eder.",
  ],
  ru: [
    "Готовы сосредоточиться и развиваться сегодня?",
    "Несколько осознанных минут могут привести к удивительному прогрессу.",
    "Ваш компаньон Studentopia верит в вас — давайте начнем!",
    "Маленькие шаги, устойчивая концентрация, большие результаты.",
    "Сделайте глубокий вдох — пора учиться спокойно и ясно.",
    "Каждое усилие сегодня приближает вас к вашим целям.",
    "Ваше учебное путешествие начинается сейчас — по одной задаче за раз.",
    "{companionName} болеет за вас — давайте сделаем сегодня важным!",
    "Вдохните концентрацию, выдохните отвлечение.",
    "Вы справитесь — ваше будущее я поблагодарит вас.",
    "Концентрация — ваша суперсила сегодня.",
    "Оставайтесь любопытными — изучение чего-то нового начинается с одной страницы.",
    "Ваш друг Studentopia гордится вашими усилиями.",
    "Давайте сделаем сегодняшнее время учебы важным!",
    "Сегодня отличный день, чтобы узнать что-то вдохновляющее.",
    "Последовательность создает уверенность — по одной сессии за раз.",
    "Сделайте глубокий вдох, найдите свой ритм и начните.",
    "Вы делаете лучше, чем думаете — продолжайте!",
    "Ваш разум готов. Давайте учиться со спокойной концентрацией.",
    "Учеба сегодня строит завтра, которое вы представляете.",
  ],
  id: [
    "Siap untuk fokus dan berkembang hari ini?",
    "Beberapa menit penuh perhatian dapat menghasilkan kemajuan luar biasa.",
    "Teman Studentopia Anda percaya pada Anda — mari kita mulai!",
    "Langkah kecil, fokus stabil, hasil besar.",
    "Tarik napas dalam-dalam — saatnya belajar dengan tenang dan jelas.",
    "Setiap usaha hari ini membawa Anda lebih dekat ke tujuan Anda.",
    "Perjalanan belajar Anda dimulai sekarang — satu tugas pada satu waktu.",
    "{companionName} mendukung Anda — mari buat hari ini berarti!",
    "Hirup fokus, hembuskan gangguan.",
    "Anda bisa melakukannya — diri masa depan Anda akan berterima kasih.",
    "Fokus adalah kekuatan super Anda hari ini.",
    "Tetap penasaran — mempelajari sesuatu yang baru dimulai dengan satu halaman.",
    "Teman Studentopia Anda bangga dengan usaha Anda.",
    "Mari buat waktu belajar hari ini berarti!",
    "Hari ini adalah hari yang hebat untuk mempelajari sesuatu yang menginspirasi.",
    "Konsistensi menciptakan kepercayaan diri — satu sesi pada satu waktu.",
    "Tarik napas dalam-dalam, temukan ritme Anda, dan mulailah.",
    "Anda melakukan lebih baik dari yang Anda kira — terus lakukan!",
    "Pikiran Anda siap. Mari belajar dengan fokus yang tenang.",
    "Belajar hari ini membangun besok yang Anda bayangkan.",
  ],
};

/**
 * Get today's daily study reminder message in the user's language
 * Rotates through 20 messages, one per day (sequentially)
 */
export const getDailyStudyReminder = (language: Language, companionName: string = "Your Companion"): string => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);

  const messages = DAILY_STUDY_REMINDERS[language] || DAILY_STUDY_REMINDERS.en;
  const messageIndex = dayOfYear % messages.length;
  let message = messages[messageIndex];

  // Replace {companionName} placeholder
  message = message.replace("{companionName}", companionName);

  return message;
};

/**
 * Get time-based greeting based on current hour in user's language
 */
export const getTimeBasedGreeting = (language: Language, username: string, hour: number = new Date().getHours()): string => {
  const greetings: Record<Language, Record<string, string>> = {
    en: {
      morning: "Good morning, {name}!",
      afternoon: "Good afternoon, {name}!",
      evening: "Good evening, {name}!",
      night: "Great work today, {name}!",
    },
    es: {
      morning: "¡Buenos días, {name}!",
      afternoon: "¡Buenas tardes, {name}!",
      evening: "¡Buenas tardes, {name}!",
      night: "¡Buen trabajo hoy, {name}!",
    },
    fr: {
      morning: "Bonjour, {name}!",
      afternoon: "Bon après-midi, {name}!",
      evening: "Bonsoir, {name}!",
      night: "Excellent travail aujourd'hui, {name}!",
    },
    de: {
      morning: "Guten Morgen, {name}!",
      afternoon: "Guten Tag, {name}!",
      evening: "Guten Abend, {name}!",
      night: "Großartige Arbeit heute, {name}!",
    },
    zh: {
      morning: "早上好，{name}！",
      afternoon: "下午好，{name}！",
      evening: "晚上好，{name}！",
      night: "今天干得好，{name}！",
    },
    ja: {
      morning: "おはようございます、{name}さん！",
      afternoon: "こんにちは、{name}さん！",
      evening: "こんばんは、{name}さん！",
      night: "今日はお疲れ様でした、{name}さん！",
    },
    ar: {
      morning: "!{name} ،صباح الخير",
      afternoon: "!{name} ،مساء الخير",
      evening: "!{name} ،مساء الخير",
      night: "!{name} ،عمل رائع اليوم",
    },
    ko: {
      morning: "{name}님, 좋은 아침입니다!",
      afternoon: "{name}님, 좋은 오후입니다!",
      evening: "{name}님, 좋은 저녁입니다!",
      night: "{name}님, 오늘 잘하셨습니다!",
    },
    pt: {
      morning: "Bom dia, {name}!",
      afternoon: "Boa tarde, {name}!",
      evening: "Boa noite, {name}!",
      night: "Ótimo trabalho hoje, {name}!",
    },
    hi: {
      morning: "सुप्रभात, {name}!",
      afternoon: "शुभ दोपहर, {name}!",
      evening: "शुभ संध्या, {name}!",
      night: "आज बढ़िया काम किया, {name}!",
    },
    it: {
      morning: "Buongiorno, {name}!",
      afternoon: "Buon pomeriggio, {name}!",
      evening: "Buonasera, {name}!",
      night: "Ottimo lavoro oggi, {name}!",
    },
    tr: {
      morning: "Günaydın, {name}!",
      afternoon: "Tünaydın, {name}!",
      evening: "İyi akşamlar, {name}!",
      night: "Bugün harika iş çıkardınız, {name}!",
    },
    ru: {
      morning: "Доброе утро, {name}!",
      afternoon: "Добрый день, {name}!",
      evening: "Добрый вечер, {name}!",
      night: "Отличная работа сегодня, {name}!",
    },
    id: {
      morning: "Selamat pagi, {name}!",
      afternoon: "Selamat siang, {name}!",
      evening: "Selamat sore, {name}!",
      night: "Kerja bagus hari ini, {name}!",
    },
  };

  let timeOfDay: string;
  if (hour >= 5 && hour < 12) {
    timeOfDay = "morning";
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = "afternoon";
  } else if (hour >= 17 && hour < 21) {
    timeOfDay = "evening";
  } else {
    timeOfDay = "night";
  }

  const langGreetings = greetings[language] || greetings.en;
  return langGreetings[timeOfDay].replace("{name}", username);
};

/**
 * Get task reminder message based on task count in user's language
 */
export const getTaskReminderMessage = (
  language: Language,
  todayTasksCount: number,
  completedCount: number,
  studyPalName: string
): string | null => {
  const pendingCount = todayTasksCount - completedCount;

  const messages: Partial<Record<Language, Record<string, string>>> = {
    en: {
      noTasks: "No tasks for today yet. Let's add your goals!",
      allComplete: `Amazing! You've completed all ${todayTasksCount} tasks today! 🎉`,
      oneTask: "You have 1 task due today — ready to start?",
      multipleTasks: `You have ${pendingCount} tasks due today — let's do this!`,
    },
    es: {
      noTasks: "No hay tareas para hoy. ¡Agreguemos tus objetivos!",
      allComplete: `¡Increíble! ¡Has completado todas las ${todayTasksCount} tareas de hoy! 🎉`,
      oneTask: "Tienes 1 tarea para hoy, ¿listo para empezar?",
      multipleTasks: `Tienes ${pendingCount} tareas para hoy: ¡hagámoslo!`,
    },
    // Other languages fall back to English
  };

  const langMessages = messages[language] || messages.en!;

  if (todayTasksCount === 0) return langMessages.noTasks;
  if (pendingCount === 0 && todayTasksCount > 0) return langMessages.allComplete;
  if (pendingCount === 1) return langMessages.oneTask;
  if (pendingCount > 1) return langMessages.multipleTasks;

  return null;
};

/**
 * Get encouragement message based on completion rate in user's language
 */
export const getEncouragementMessage = (
  language: Language,
  completionRate: number,
  studyPalName: string
): string | null => {
  const messages: Partial<Record<Language, Record<string, string>>> = {
    en: {
      perfect: "Perfect! You're on fire today! 🔥",
      great: "Great progress! Keep it up!",
      halfway: "You're halfway there! Keep going!",
      goodStart: "Good start! You've got momentum!",
      everyStep: "Every step forward counts!",
    },
    es: {
      perfect: "¡Perfecto! ¡Estás en llamas hoy! 🔥",
      great: "¡Gran progreso! ¡Sigue así!",
      halfway: "¡Vas por la mitad! ¡Continúa!",
      goodStart: "¡Buen comienzo! ¡Tienes impulso!",
      everyStep: "¡Cada paso adelante cuenta!",
    },
    // Other languages fall back to English
  };

  const langMessages = messages[language] || messages.en!;

  if (completionRate === 100) return langMessages.perfect;
  if (completionRate >= 75) return langMessages.great;
  if (completionRate >= 50) return langMessages.halfway;
  if (completionRate >= 25) return langMessages.goodStart;
  if (completionRate > 0) return langMessages.everyStep;

  return null;
};

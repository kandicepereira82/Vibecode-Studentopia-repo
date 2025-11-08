import { Language } from "../types";
import { extendedTranslations, mergeTranslations } from "./translations-extended";

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    home: "Home",
    tasks: "Tasks",
    calendar: "Calendar",
    timer: "Timer",
    aiHelper: "AI Helper",
    profile: "Profile",

    // Home Screen
    welcomeBack: "Welcome Back",
    todayProgress: "Today's Progress",
    weeklyProgress: "Weekly Progress",
    tasksCompleted: "Tasks Completed",
    currentStreak: "Day Streak",
    motivationalQuote: "Quote of the Day",
    studyTip: "Study Tip",

    // Tasks
    addTask: "Add Task",
    editTask: "Edit Task",
    deleteTask: "Delete Task",
    taskTitle: "Task Title",
    taskDescription: "Description",
    category: "Category",
    dueDate: "Due Date",
    reminder: "Reminder",
    homework: "Homework",
    project: "Project",
    exam: "Exam",
    other: "Other",
    pending: "Pending",
    completed: "Completed",

    // Timer
    studySession: "Study Session",
    breakTime: "Break Time",
    start: "Start",
    pause: "Pause",
    resume: "Resume",
    stop: "Stop",
    minutes: "minutes",
    backgroundMusic: "Background Music",

    // AI Helper
    askQuestion: "Ask a question...",
    chatMode: "Chat Mode",
    grammarMode: "Grammar Checker",
    checkGrammar: "Check Grammar",

    // Profile
    username: "Username",
    language: "Language",
    theme: "Theme",
    studyPalName: "Studentopia Companion Name",
    studyPalAnimal: "Studentopia Companion Animal",
    animations: "Animations",
    notifications: "Notifications",
    logout: "Logout",

    // Groups
    myGroups: "My Groups",
    createGroup: "Create Group",
    joinGroup: "Join Group",
    groupName: "Group Name",
    groupDescription: "Description",

    // Common
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    done: "Done",
    close: "Close",
    yes: "Yes",
    no: "No",
    settings: "Settings",

    // Music Player
    musicPlayer: "Music Player",
    nowPlaying: "Now Playing",
    musicLibrary: "Music Library",
    filterByMood: "Filter by Mood",
    all: "All",
    calming: "Calming",
    uplifting: "Uplifting",
    peaceful: "Peaceful",
    calmingClassicalMusic: "Calming classical music for studying",

    // Animals
    cat: "Cat",
    bunny: "Bunny",
    bear: "Bear",
    dog: "Dog",
    fox: "Fox",
    panda: "Panda",
  },
  es: {
    // Navigation
    home: "Inicio",
    tasks: "Tareas",
    calendar: "Calendario",
    timer: "Temporizador",
    aiHelper: "Asistente IA",
    profile: "Perfil",

    // Home Screen
    welcomeBack: "Bienvenido de nuevo",
    todayProgress: "Progreso de hoy",
    weeklyProgress: "Progreso semanal",
    tasksCompleted: "Tareas completadas",
    currentStreak: "Racha de días",
    motivationalQuote: "Frase del día",
    studyTip: "Consejo de estudio",

    // Tasks
    addTask: "Añadir tarea",
    editTask: "Editar tarea",
    deleteTask: "Eliminar tarea",
    taskTitle: "Título de la tarea",
    taskDescription: "Descripción",
    category: "Categoría",
    dueDate: "Fecha de vencimiento",
    reminder: "Recordatorio",
    homework: "Deberes",
    project: "Proyecto",
    exam: "Examen",
    other: "Otro",
    pending: "Pendiente",
    completed: "Completado",

    // Timer
    studySession: "Sesión de estudio",
    breakTime: "Tiempo de descanso",
    start: "Iniciar",
    pause: "Pausar",
    resume: "Reanudar",
    stop: "Detener",
    minutes: "minutos",
    backgroundMusic: "Música de fondo",

    // AI Helper
    askQuestion: "Haz una pregunta...",
    chatMode: "Modo chat",
    grammarMode: "Corrector gramatical",
    checkGrammar: "Verificar gramática",

    // Profile
    username: "Nombre de usuario",
    language: "Idioma",
    theme: "Tema",
    studyPalName: "Nombre del compañero",
    studyPalAnimal: "Animal del compañero",
    animations: "Animaciones",
    notifications: "Notificaciones",
    logout: "Cerrar sesión",

    // Groups
    myGroups: "Mis grupos",
    createGroup: "Crear grupo",
    joinGroup: "Unirse a grupo",
    groupName: "Nombre del grupo",
    groupDescription: "Descripción",

    // Common
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    done: "Hecho",
    close: "Cerrar",
    yes: "Sí",
    no: "No",
    settings: "Configuración",

    // Music Player
    musicPlayer: "Reproductor de Música",
    nowPlaying: "Reproduciendo ahora",
    musicLibrary: "Biblioteca musical",
    filterByMood: "Filtrar por estado de ánimo",
    all: "Todos",
    calming: "Calmante",
    uplifting: "Edificante",
    peaceful: "Pacífico",
    calmingClassicalMusic: "Música clásica relajante para estudiar",

    // Animals
    cat: "Gato",
    bunny: "Conejo",
    bear: "Oso",
    dog: "Perro",
    fox: "Zorro",
    panda: "Panda",
  },
  fr: {
    // Navigation
    home: "Accueil",
    tasks: "Tâches",
    calendar: "Calendrier",
    timer: "Minuteur",
    aiHelper: "Assistant IA",
    profile: "Profil",

    // Home Screen
    welcomeBack: "Bon retour",
    todayProgress: "Progrès du jour",
    weeklyProgress: "Progrès hebdomadaire",
    tasksCompleted: "Tâches terminées",
    currentStreak: "Série de jours",
    motivationalQuote: "Citation du jour",
    studyTip: "Conseil d'étude",

    // Tasks
    addTask: "Ajouter une tâche",
    editTask: "Modifier la tâche",
    deleteTask: "Supprimer la tâche",
    taskTitle: "Titre de la tâche",
    taskDescription: "Description",
    category: "Catégorie",
    dueDate: "Date d'échéance",
    reminder: "Rappel",
    homework: "Devoirs",
    project: "Projet",
    exam: "Examen",
    other: "Autre",
    pending: "En attente",
    completed: "Terminé",

    // Timer
    studySession: "Session d'étude",
    breakTime: "Temps de pause",
    start: "Démarrer",
    pause: "Pause",
    resume: "Reprendre",
    stop: "Arrêter",
    minutes: "minutes",
    backgroundMusic: "Musique de fond",

    // AI Helper
    askQuestion: "Posez une question...",
    chatMode: "Mode chat",
    grammarMode: "Correcteur grammatical",
    checkGrammar: "Vérifier la grammaire",

    // Profile
    username: "Nom d'utilisateur",
    language: "Langue",
    theme: "Thème",
    studyPalName: "Nom du compagnon",
    studyPalAnimal: "Animal du compagnon",
    animations: "Animations",
    notifications: "Notifications",
    logout: "Se déconnecter",

    // Groups
    myGroups: "Mes groupes",
    createGroup: "Créer un groupe",
    joinGroup: "Rejoindre un groupe",
    groupName: "Nom du groupe",
    groupDescription: "Description",

    // Common
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    done: "Terminé",
    close: "Fermer",
    yes: "Oui",
    no: "Non",
    settings: "Paramètres",

    // Music Player
    musicPlayer: "Lecteur de musique",
    nowPlaying: "En cours de lecture",
    musicLibrary: "Bibliothèque musicale",
    filterByMood: "Filtrer par humeur",
    all: "Tous",
    calming: "Apaisant",
    uplifting: "Stimulant",
    peaceful: "Paisible",
    calmingClassicalMusic: "Musique classique apaisante pour étudier",

    // Animals
    cat: "Chat",
    bunny: "Lapin",
    bear: "Ours",
    dog: "Chien",
    fox: "Renard",
    panda: "Panda",
  },
  de: {
    // Navigation
    home: "Startseite",
    tasks: "Aufgaben",
    calendar: "Kalender",
    timer: "Timer",
    aiHelper: "KI-Assistent",
    profile: "Profil",

    // Home Screen
    welcomeBack: "Willkommen zurück",
    todayProgress: "Heutiger Fortschritt",
    weeklyProgress: "Wöchentlicher Fortschritt",
    tasksCompleted: "Aufgaben erledigt",
    currentStreak: "Tage-Serie",
    motivationalQuote: "Zitat des Tages",
    studyTip: "Lerntipp",

    // Tasks
    addTask: "Aufgabe hinzufügen",
    editTask: "Aufgabe bearbeiten",
    deleteTask: "Aufgabe löschen",
    taskTitle: "Aufgabentitel",
    taskDescription: "Beschreibung",
    category: "Kategorie",
    dueDate: "Fälligkeitsdatum",
    reminder: "Erinnerung",
    homework: "Hausaufgaben",
    project: "Projekt",
    exam: "Prüfung",
    other: "Andere",
    pending: "Ausstehend",
    completed: "Erledigt",

    // Timer
    studySession: "Lernsitzung",
    breakTime: "Pausenzeit",
    start: "Starten",
    pause: "Pause",
    resume: "Fortsetzen",
    stop: "Stoppen",
    minutes: "Minuten",
    backgroundMusic: "Hintergrundmusik",

    // AI Helper
    askQuestion: "Stelle eine Frage...",
    chatMode: "Chat-Modus",
    grammarMode: "Grammatikprüfer",
    checkGrammar: "Grammatik prüfen",

    // Profile
    username: "Benutzername",
    language: "Sprache",
    theme: "Thema",
    studyPalName: "Name des Lernfreunds",
    studyPalAnimal: "Tier des Lernfreunds",
    animations: "Animationen",
    notifications: "Benachrichtigungen",
    logout: "Abmelden",

    // Groups
    myGroups: "Meine Gruppen",
    createGroup: "Gruppe erstellen",
    joinGroup: "Gruppe beitreten",
    groupName: "Gruppenname",
    groupDescription: "Beschreibung",

    // Common
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    edit: "Bearbeiten",
    done: "Fertig",
    close: "Schließen",
    yes: "Ja",
    no: "Nein",
    settings: "Einstellungen",

    // Music Player
    musicPlayer: "Musik-Player",
    nowPlaying: "Jetzt läuft",
    musicLibrary: "Musikbibliothek",
    filterByMood: "Nach Stimmung filtern",
    all: "Alle",
    calming: "Beruhigend",
    uplifting: "Erhebend",
    peaceful: "Friedlich",
    calmingClassicalMusic: "Beruhigende klassische Musik zum Lernen",

    // Animals
    cat: "Katze",
    bunny: "Hase",
    bear: "Bär",
    dog: "Hund",
    fox: "Fuchs",
    panda: "Panda",
  },
  zh: {
    // Navigation
    home: "首页",
    tasks: "任务",
    calendar: "日历",
    timer: "计时器",
    aiHelper: "AI助手",
    profile: "个人资料",

    // Home Screen
    welcomeBack: "欢迎回来",
    todayProgress: "今日进度",
    weeklyProgress: "每周进度",
    tasksCompleted: "已完成任务",
    currentStreak: "连续天数",
    motivationalQuote: "每日名言",
    studyTip: "学习技巧",

    // Tasks
    addTask: "添加任务",
    editTask: "编辑任务",
    deleteTask: "删除任务",
    taskTitle: "任务标题",
    taskDescription: "描述",
    category: "类别",
    dueDate: "截止日期",
    reminder: "提醒",
    homework: "作业",
    project: "项目",
    exam: "考试",
    other: "其他",
    pending: "待办",
    completed: "已完成",

    // Timer
    studySession: "学习时段",
    breakTime: "休息时间",
    start: "开始",
    pause: "暂停",
    resume: "继续",
    stop: "停止",
    minutes: "分钟",
    backgroundMusic: "背景音乐",

    // AI Helper
    askQuestion: "提出问题...",
    chatMode: "聊天模式",
    grammarMode: "语法检查器",
    checkGrammar: "检查语法",

    // Profile
    username: "用户名",
    language: "语言",
    theme: "主题",
    studyPalName: "学习伙伴名称",
    studyPalAnimal: "学习伙伴动物",
    animations: "动画",
    notifications: "通知",
    logout: "退出",

    // Groups
    myGroups: "我的小组",
    createGroup: "创建小组",
    joinGroup: "加入小组",
    groupName: "小组名称",
    groupDescription: "描述",

    // Common
    save: "保存",
    cancel: "取消",
    delete: "删除",
    edit: "编辑",
    done: "完成",
    close: "关闭",
    yes: "是",
    no: "否",
    settings: "设置",

    // Music Player
    musicPlayer: "音乐播放器",
    nowPlaying: "正在播放",
    musicLibrary: "音乐库",
    filterByMood: "按心情筛选",
    all: "全部",
    calming: "平静",
    uplifting: "振奋",
    peaceful: "安宁",
    calmingClassicalMusic: "用于学习的舒缓古典音乐",

    // Animals
    cat: "猫",
    bunny: "兔子",
    bear: "熊",
    dog: "狗",
    fox: "狐狸",
    panda: "熊猫",
  },
  ja: {
    // Navigation
    home: "ホーム",
    tasks: "タスク",
    calendar: "カレンダー",
    timer: "タイマー",
    aiHelper: "AIアシスタント",
    profile: "プロフィール",

    // Home Screen
    welcomeBack: "おかえりなさい",
    todayProgress: "今日の進捗",
    weeklyProgress: "週間進捗",
    tasksCompleted: "完了したタスク",
    currentStreak: "連続日数",
    motivationalQuote: "今日の名言",
    studyTip: "学習のヒント",

    // Tasks
    addTask: "タスクを追加",
    editTask: "タスクを編集",
    deleteTask: "タスクを削除",
    taskTitle: "タスク名",
    taskDescription: "説明",
    category: "カテゴリー",
    dueDate: "期限",
    reminder: "リマインダー",
    homework: "宿題",
    project: "プロジェクト",
    exam: "試験",
    other: "その他",
    pending: "保留中",
    completed: "完了",

    // Timer
    studySession: "学習セッション",
    breakTime: "休憩時間",
    start: "開始",
    pause: "一時停止",
    resume: "再開",
    stop: "停止",
    minutes: "分",
    backgroundMusic: "BGM",

    // AI Helper
    askQuestion: "質問してください...",
    chatMode: "チャットモード",
    grammarMode: "文法チェッカー",
    checkGrammar: "文法をチェック",

    // Profile
    username: "ユーザー名",
    language: "言語",
    theme: "テーマ",
    studyPalName: "学習パートナーの名前",
    studyPalAnimal: "学習パートナーの動物",
    animations: "アニメーション",
    notifications: "通知",
    logout: "ログアウト",

    // Groups
    myGroups: "マイグループ",
    createGroup: "グループを作成",
    joinGroup: "グループに参加",
    groupName: "グループ名",
    groupDescription: "説明",

    // Common
    save: "保存",
    cancel: "キャンセル",
    delete: "削除",
    edit: "編集",
    done: "完了",
    close: "閉じる",
    yes: "はい",
    no: "いいえ",
    settings: "設定",

    // Music Player
    musicPlayer: "ミュージックプレーヤー",
    nowPlaying: "再生中",
    musicLibrary: "ミュージックライブラリ",
    filterByMood: "ムードで絞り込む",
    all: "すべて",
    calming: "落ち着く",
    uplifting: "高揚感",
    peaceful: "穏やか",
    calmingClassicalMusic: "勉強用の落ち着くクラシック音楽",

    // Animals
    cat: "猫",
    bunny: "うさぎ",
    bear: "くま",
    dog: "犬",
    fox: "きつね",
    panda: "パンダ",
  },
  ar: {
    // Navigation
    home: "الرئيسية",
    tasks: "المهام",
    calendar: "التقويم",
    timer: "المؤقت",
    aiHelper: "مساعد الذكاء الاصطناعي",
    profile: "الملف الشخصي",

    // Home Screen
    welcomeBack: "مرحبًا بعودتك",
    todayProgress: "تقدم اليوم",
    weeklyProgress: "التقدم الأسبوعي",
    tasksCompleted: "المهام المكتملة",
    currentStreak: "سلسلة الأيام",
    motivationalQuote: "اقتباس اليوم",
    studyTip: "نصيحة للدراسة",

    // Tasks
    addTask: "إضافة مهمة",
    editTask: "تحرير المهمة",
    deleteTask: "حذف المهمة",
    taskTitle: "عنوان المهمة",
    taskDescription: "الوصف",
    category: "الفئة",
    dueDate: "تاريخ الاستحقاق",
    reminder: "تذكير",
    homework: "الواجب المنزلي",
    project: "مشروع",
    exam: "امتحان",
    other: "أخرى",
    pending: "قيد الانتظار",
    completed: "مكتمل",

    // Timer
    studySession: "جلسة دراسية",
    breakTime: "وقت الراحة",
    start: "بدء",
    pause: "إيقاف مؤقت",
    resume: "استئناف",
    stop: "إيقاف",
    minutes: "دقائق",
    backgroundMusic: "موسيقى الخلفية",

    // AI Helper
    askQuestion: "اطرح سؤالاً...",
    chatMode: "وضع الدردشة",
    grammarMode: "مدقق القواعد",
    checkGrammar: "التحقق من القواعد",

    // Profile
    username: "اسم المستخدم",
    language: "اللغة",
    theme: "المظهر",
    studyPalName: "اسم الرفيق الدراسي",
    studyPalAnimal: "حيوان الرفيق الدراسي",
    animations: "الرسوم المتحركة",
    notifications: "الإشعارات",
    logout: "تسجيل الخروج",

    // Groups
    myGroups: "مجموعاتي",
    createGroup: "إنشاء مجموعة",
    joinGroup: "الانضمام إلى مجموعة",
    groupName: "اسم المجموعة",
    groupDescription: "الوصف",

    // Common
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تحرير",
    done: "تم",
    close: "إغلاق",
    yes: "نعم",
    no: "لا",
    settings: "الإعدادات",

    // Music Player
    musicPlayer: "مشغل الموسيقى",
    nowPlaying: "يتم التشغيل الآن",
    musicLibrary: "مكتبة الموسيقى",
    filterByMood: "تصفية حسب المزاج",
    all: "الكل",
    calming: "مهدئ",
    uplifting: "منعش",
    peaceful: "هادئ",
    calmingClassicalMusic: "موسيقى كلاسيكية مهدئة للدراسة",

    // Animals
    cat: "قطة",
    bunny: "أرنب",
    bear: "دب",
    dog: "كلب",
    fox: "ثعلب",
    panda: "باندا",
  },
  ko: {
    // Navigation
    home: "홈",
    tasks: "작업",
    calendar: "캘린더",
    timer: "타이머",
    aiHelper: "AI 도우미",
    profile: "프로필",

    // Home Screen
    welcomeBack: "돌아오신 것을 환영합니다",
    todayProgress: "오늘의 진행 상황",
    weeklyProgress: "주간 진행 상황",
    tasksCompleted: "완료된 작업",
    currentStreak: "연속 일수",
    motivationalQuote: "오늘의 명언",
    studyTip: "학습 팁",

    // Tasks
    addTask: "작업 추가",
    editTask: "작업 편집",
    deleteTask: "작업 삭제",
    taskTitle: "작업 제목",
    taskDescription: "설명",
    category: "카테고리",
    dueDate: "마감일",
    reminder: "알림",
    homework: "숙제",
    project: "프로젝트",
    exam: "시험",
    other: "기타",
    pending: "대기 중",
    completed: "완료됨",

    // Timer
    studySession: "학습 세션",
    breakTime: "휴식 시간",
    start: "시작",
    pause: "일시 정지",
    resume: "재개",
    stop: "정지",
    minutes: "분",
    backgroundMusic: "배경 음악",

    // AI Helper
    askQuestion: "질문하기...",
    chatMode: "채팅 모드",
    grammarMode: "문법 검사기",
    checkGrammar: "문법 확인",

    // Profile
    username: "사용자 이름",
    language: "언어",
    theme: "테마",
    studyPalName: "학습 친구 이름",
    studyPalAnimal: "학습 친구 동물",
    animations: "애니메이션",
    notifications: "알림",
    logout: "로그아웃",

    // Groups
    myGroups: "내 그룹",
    createGroup: "그룹 만들기",
    joinGroup: "그룹 가입",
    groupName: "그룹 이름",
    groupDescription: "설명",

    // Common
    save: "저장",
    cancel: "취소",
    delete: "삭제",
    edit: "편집",
    done: "완료",
    close: "닫기",
    yes: "예",
    no: "아니요",
    settings: "설정",

    // Music Player
    musicPlayer: "음악 플레이어",
    nowPlaying: "재생 중",
    musicLibrary: "음악 라이브러리",
    filterByMood: "분위기별 필터",
    all: "전체",
    calming: "차분한",
    uplifting: "기분 좋은",
    peaceful: "평화로운",
    calmingClassicalMusic: "공부를 위한 차분한 클래식 음악",

    // Animals
    cat: "고양이",
    bunny: "토끼",
    bear: "곰",
    dog: "개",
    fox: "여우",
    panda: "판다",
  },
  pt: {
    // Navigation
    home: "Início",
    tasks: "Tarefas",
    calendar: "Calendário",
    timer: "Cronômetro",
    aiHelper: "Assistente IA",
    profile: "Perfil",

    // Home Screen
    welcomeBack: "Bem-vindo de volta",
    todayProgress: "Progresso de hoje",
    weeklyProgress: "Progresso semanal",
    tasksCompleted: "Tarefas concluídas",
    currentStreak: "Sequência de dias",
    motivationalQuote: "Citação do dia",
    studyTip: "Dica de estudo",

    // Tasks
    addTask: "Adicionar tarefa",
    editTask: "Editar tarefa",
    deleteTask: "Excluir tarefa",
    taskTitle: "Título da tarefa",
    taskDescription: "Descrição",
    category: "Categoria",
    dueDate: "Data de vencimento",
    reminder: "Lembrete",
    homework: "Lição de casa",
    project: "Projeto",
    exam: "Prova",
    other: "Outro",
    pending: "Pendente",
    completed: "Concluído",

    // Timer
    studySession: "Sessão de estudo",
    breakTime: "Tempo de pausa",
    start: "Iniciar",
    pause: "Pausar",
    resume: "Retomar",
    stop: "Parar",
    minutes: "minutos",
    backgroundMusic: "Música de fundo",

    // AI Helper
    askQuestion: "Faça uma pergunta...",
    chatMode: "Modo chat",
    grammarMode: "Verificador gramatical",
    checkGrammar: "Verificar gramática",

    // Profile
    username: "Nome de usuário",
    language: "Idioma",
    theme: "Tema",
    studyPalName: "Nome do companheiro",
    studyPalAnimal: "Animal do companheiro",
    animations: "Animações",
    notifications: "Notificações",
    logout: "Sair",

    // Groups
    myGroups: "Meus grupos",
    createGroup: "Criar grupo",
    joinGroup: "Entrar no grupo",
    groupName: "Nome do grupo",
    groupDescription: "Descrição",

    // Common
    save: "Salvar",
    cancel: "Cancelar",
    delete: "Excluir",
    edit: "Editar",
    done: "Concluído",
    close: "Fechar",
    yes: "Sim",
    no: "Não",
    settings: "Configurações",

    // Music Player
    musicPlayer: "Reprodutor de Música",
    nowPlaying: "Tocando agora",
    musicLibrary: "Biblioteca musical",
    filterByMood: "Filtrar por humor",
    all: "Todos",
    calming: "Calmante",
    uplifting: "Edificante",
    peaceful: "Pacífico",
    calmingClassicalMusic: "Música clássica calmante para estudar",

    // Animals
    cat: "Gato",
    bunny: "Coelho",
    bear: "Urso",
    dog: "Cachorro",
    fox: "Raposa",
    panda: "Panda",
  },
  hi: {
    // Navigation
    home: "होम",
    tasks: "कार्य",
    calendar: "कैलेंडर",
    timer: "टाइमर",
    aiHelper: "AI सहायक",
    profile: "प्रोफ़ाइल",

    // Home Screen
    welcomeBack: "वापसी पर स्वागत है",
    todayProgress: "आज की प्रगति",
    weeklyProgress: "साप्ताहिक प्रगति",
    tasksCompleted: "पूर्ण कार्य",
    currentStreak: "दिनों की श्रृंखला",
    motivationalQuote: "आज का उद्धरण",
    studyTip: "अध्ययन सुझाव",

    // Tasks
    addTask: "कार्य जोड़ें",
    editTask: "कार्य संपादित करें",
    deleteTask: "कार्य हटाएं",
    taskTitle: "कार्य शीर्षक",
    taskDescription: "विवरण",
    category: "श्रेणी",
    dueDate: "नियत तिथि",
    reminder: "अनुस्मारक",
    homework: "गृहकार्य",
    project: "परियोजना",
    exam: "परीक्षा",
    other: "अन्य",
    pending: "लंबित",
    completed: "पूर्ण",

    // Timer
    studySession: "अध्ययन सत्र",
    breakTime: "विश्राम समय",
    start: "शुरू करें",
    pause: "रोकें",
    resume: "फिर से शुरू करें",
    stop: "बंद करें",
    minutes: "मिनट",
    backgroundMusic: "पृष्ठभूमि संगीत",

    // AI Helper
    askQuestion: "प्रश्न पूछें...",
    chatMode: "चैट मोड",
    grammarMode: "व्याकरण जांचकर्ता",
    checkGrammar: "व्याकरण जांचें",

    // Profile
    username: "उपयोगकर्ता नाम",
    language: "भाषा",
    theme: "थीम",
    studyPalName: "अध्ययन साथी का नाम",
    studyPalAnimal: "अध्ययन साथी का जानवर",
    animations: "एनिमेशन",
    notifications: "सूचनाएं",
    logout: "लॉग आउट",

    // Groups
    myGroups: "मेरे समूह",
    createGroup: "समूह बनाएं",
    joinGroup: "समूह में शामिल हों",
    groupName: "समूह का नाम",
    groupDescription: "विवरण",

    // Common
    save: "सहेजें",
    cancel: "रद्द करें",
    delete: "हटाएं",
    edit: "संपादित करें",
    done: "पूर्ण",
    close: "बंद करें",
    yes: "हां",
    no: "नहीं",
    settings: "सेटिंग्स",

    // Music Player
    musicPlayer: "संगीत प्लेयर",
    nowPlaying: "अभी चल रहा है",
    musicLibrary: "संगीत पुस्तकालय",
    filterByMood: "मूड के अनुसार फ़िल्टर करें",
    all: "सभी",
    calming: "शांत करने वाला",
    uplifting: "उत्साहजनक",
    peaceful: "शांतिपूर्ण",
    calmingClassicalMusic: "अध्ययन के लिए शांत शास्त्रीय संगीत",

    // Animals
    cat: "बिल्ली",
    bunny: "खरगोश",
    bear: "भालू",
    dog: "कुत्ता",
    fox: "लोमड़ी",
    panda: "पांडा",
  },
  it: {
    // Navigation
    home: "Home",
    tasks: "Compiti",
    calendar: "Calendario",
    timer: "Timer",
    aiHelper: "Assistente IA",
    profile: "Profilo",

    // Home Screen
    welcomeBack: "Bentornato",
    todayProgress: "Progresso di oggi",
    weeklyProgress: "Progresso settimanale",
    tasksCompleted: "Compiti completati",
    currentStreak: "Serie di giorni",
    motivationalQuote: "Citazione del giorno",
    studyTip: "Consiglio di studio",

    // Tasks
    addTask: "Aggiungi compito",
    editTask: "Modifica compito",
    deleteTask: "Elimina compito",
    taskTitle: "Titolo del compito",
    taskDescription: "Descrizione",
    category: "Categoria",
    dueDate: "Data di scadenza",
    reminder: "Promemoria",
    homework: "Compiti a casa",
    project: "Progetto",
    exam: "Esame",
    other: "Altro",
    pending: "In sospeso",
    completed: "Completato",

    // Timer
    studySession: "Sessione di studio",
    breakTime: "Tempo di pausa",
    start: "Inizia",
    pause: "Pausa",
    resume: "Riprendi",
    stop: "Ferma",
    minutes: "minuti",
    backgroundMusic: "Musica di sottofondo",

    // AI Helper
    askQuestion: "Fai una domanda...",
    chatMode: "Modalità chat",
    grammarMode: "Controllo grammaticale",
    checkGrammar: "Controlla grammatica",

    // Profile
    username: "Nome utente",
    language: "Lingua",
    theme: "Tema",
    studyPalName: "Nome del compagno",
    studyPalAnimal: "Animale del compagno",
    animations: "Animazioni",
    notifications: "Notifiche",
    logout: "Esci",

    // Groups
    myGroups: "I miei gruppi",
    createGroup: "Crea gruppo",
    joinGroup: "Unisciti al gruppo",
    groupName: "Nome del gruppo",
    groupDescription: "Descrizione",

    // Common
    save: "Salva",
    cancel: "Annulla",
    delete: "Elimina",
    edit: "Modifica",
    done: "Fatto",
    close: "Chiudi",
    yes: "Sì",
    no: "No",
    settings: "Impostazioni",

    // Music Player
    musicPlayer: "Lettore musicale",
    nowPlaying: "In riproduzione",
    musicLibrary: "Libreria musicale",
    filterByMood: "Filtra per umore",
    all: "Tutti",
    calming: "Calmante",
    uplifting: "Edificante",
    peaceful: "Pacifico",
    calmingClassicalMusic: "Musica classica rilassante per studiare",

    // Animals
    cat: "Gatto",
    bunny: "Coniglio",
    bear: "Orso",
    dog: "Cane",
    fox: "Volpe",
    panda: "Panda",
  },
  tr: {
    // Navigation
    home: "Ana Sayfa",
    tasks: "Görevler",
    calendar: "Takvim",
    timer: "Zamanlayıcı",
    aiHelper: "AI Asistanı",
    profile: "Profil",

    // Home Screen
    welcomeBack: "Tekrar hoş geldiniz",
    todayProgress: "Bugünün ilerlemesi",
    weeklyProgress: "Haftalık ilerleme",
    tasksCompleted: "Tamamlanan görevler",
    currentStreak: "Gün serisi",
    motivationalQuote: "Günün sözü",
    studyTip: "Çalışma ipucu",

    // Tasks
    addTask: "Görev ekle",
    editTask: "Görevi düzenle",
    deleteTask: "Görevi sil",
    taskTitle: "Görev başlığı",
    taskDescription: "Açıklama",
    category: "Kategori",
    dueDate: "Son tarih",
    reminder: "Hatırlatıcı",
    homework: "Ödev",
    project: "Proje",
    exam: "Sınav",
    other: "Diğer",
    pending: "Beklemede",
    completed: "Tamamlandı",

    // Timer
    studySession: "Çalışma seansı",
    breakTime: "Mola zamanı",
    start: "Başlat",
    pause: "Duraklat",
    resume: "Devam et",
    stop: "Durdur",
    minutes: "dakika",
    backgroundMusic: "Arka plan müziği",

    // AI Helper
    askQuestion: "Bir soru sor...",
    chatMode: "Sohbet modu",
    grammarMode: "Dilbilgisi denetleyicisi",
    checkGrammar: "Dilbilgisini kontrol et",

    // Profile
    username: "Kullanıcı adı",
    language: "Dil",
    theme: "Tema",
    studyPalName: "Çalışma arkadaşı adı",
    studyPalAnimal: "Çalışma arkadaşı hayvanı",
    animations: "Animasyonlar",
    notifications: "Bildirimler",
    logout: "Çıkış yap",

    // Groups
    myGroups: "Gruplarım",
    createGroup: "Grup oluştur",
    joinGroup: "Gruba katıl",
    groupName: "Grup adı",
    groupDescription: "Açıklama",

    // Common
    save: "Kaydet",
    cancel: "İptal",
    delete: "Sil",
    edit: "Düzenle",
    done: "Tamam",
    close: "Kapat",
    yes: "Evet",
    no: "Hayır",
    settings: "Ayarlar",

    // Music Player
    musicPlayer: "Müzik Çalar",
    nowPlaying: "Şimdi çalıyor",
    musicLibrary: "Müzik kütüphanesi",
    filterByMood: "Ruh haline göre filtrele",
    all: "Tümü",
    calming: "Sakinleştirici",
    uplifting: "Moral verici",
    peaceful: "Huzurlu",
    calmingClassicalMusic: "Çalışmak için sakinleştirici klasik müzik",

    // Animals
    cat: "Kedi",
    bunny: "Tavşan",
    bear: "Ayı",
    dog: "Köpek",
    fox: "Tilki",
    panda: "Panda",
  },
  ru: {
    // Navigation
    home: "Главная",
    tasks: "Задачи",
    calendar: "Календарь",
    timer: "Таймер",
    aiHelper: "AI помощник",
    profile: "Профиль",

    // Home Screen
    welcomeBack: "С возвращением",
    todayProgress: "Прогресс сегодня",
    weeklyProgress: "Недельный прогресс",
    tasksCompleted: "Выполненные задачи",
    currentStreak: "Серия дней",
    motivationalQuote: "Цитата дня",
    studyTip: "Совет по учебе",

    // Tasks
    addTask: "Добавить задачу",
    editTask: "Редактировать задачу",
    deleteTask: "Удалить задачу",
    taskTitle: "Название задачи",
    taskDescription: "Описание",
    category: "Категория",
    dueDate: "Срок выполнения",
    reminder: "Напоминание",
    homework: "Домашнее задание",
    project: "Проект",
    exam: "Экзамен",
    other: "Другое",
    pending: "В ожидании",
    completed: "Завершено",

    // Timer
    studySession: "Учебная сессия",
    breakTime: "Время перерыва",
    start: "Начать",
    pause: "Пауза",
    resume: "Продолжить",
    stop: "Остановить",
    minutes: "минут",
    backgroundMusic: "Фоновая музыка",

    // AI Helper
    askQuestion: "Задайте вопрос...",
    chatMode: "Режим чата",
    grammarMode: "Проверка грамматики",
    checkGrammar: "Проверить грамматику",

    // Profile
    username: "Имя пользователя",
    language: "Язык",
    theme: "Тема",
    studyPalName: "Имя учебного партнера",
    studyPalAnimal: "Животное учебного партнера",
    animations: "Анимации",
    notifications: "Уведомления",
    logout: "Выйти",

    // Groups
    myGroups: "Мои группы",
    createGroup: "Создать группу",
    joinGroup: "Присоединиться к группе",
    groupName: "Название группы",
    groupDescription: "Описание",

    // Common
    save: "Сохранить",
    cancel: "Отмена",
    delete: "Удалить",
    edit: "Редактировать",
    done: "Готово",
    close: "Закрыть",
    yes: "Да",
    no: "Нет",
    settings: "Настройки",

    // Music Player
    musicPlayer: "Музыкальный плеер",
    nowPlaying: "Сейчас играет",
    musicLibrary: "Музыкальная библиотека",
    filterByMood: "Фильтр по настроению",
    all: "Все",
    calming: "Успокаивающее",
    uplifting: "Поднимающее настроение",
    peaceful: "Умиротворяющее",
    calmingClassicalMusic: "Успокаивающая классическая музыка для учебы",

    // Animals
    cat: "Кошка",
    bunny: "Кролик",
    bear: "Медведь",
    dog: "Собака",
    fox: "Лиса",
    panda: "Панда",
  },
  id: {
    // Navigation
    home: "Beranda",
    tasks: "Tugas",
    calendar: "Kalender",
    timer: "Timer",
    aiHelper: "Asisten AI",
    profile: "Profil",

    // Home Screen
    welcomeBack: "Selamat datang kembali",
    todayProgress: "Kemajuan hari ini",
    weeklyProgress: "Kemajuan mingguan",
    tasksCompleted: "Tugas selesai",
    currentStreak: "Seri hari",
    motivationalQuote: "Kutipan hari ini",
    studyTip: "Tips belajar",

    // Tasks
    addTask: "Tambah tugas",
    editTask: "Edit tugas",
    deleteTask: "Hapus tugas",
    taskTitle: "Judul tugas",
    taskDescription: "Deskripsi",
    category: "Kategori",
    dueDate: "Tanggal jatuh tempo",
    reminder: "Pengingat",
    homework: "Pekerjaan rumah",
    project: "Proyek",
    exam: "Ujian",
    other: "Lainnya",
    pending: "Tertunda",
    completed: "Selesai",

    // Timer
    studySession: "Sesi belajar",
    breakTime: "Waktu istirahat",
    start: "Mulai",
    pause: "Jeda",
    resume: "Lanjutkan",
    stop: "Berhenti",
    minutes: "menit",
    backgroundMusic: "Musik latar",

    // AI Helper
    askQuestion: "Ajukan pertanyaan...",
    chatMode: "Mode obrolan",
    grammarMode: "Pemeriksa tata bahasa",
    checkGrammar: "Periksa tata bahasa",

    // Profile
    username: "Nama pengguna",
    language: "Bahasa",
    theme: "Tema",
    studyPalName: "Nama teman belajar",
    studyPalAnimal: "Hewan teman belajar",
    animations: "Animasi",
    notifications: "Notifikasi",
    logout: "Keluar",

    // Groups
    myGroups: "Grup saya",
    createGroup: "Buat grup",
    joinGroup: "Gabung grup",
    groupName: "Nama grup",
    groupDescription: "Deskripsi",

    // Common
    save: "Simpan",
    cancel: "Batal",
    delete: "Hapus",
    edit: "Edit",
    done: "Selesai",
    close: "Tutup",
    yes: "Ya",
    no: "Tidak",
    settings: "Pengaturan",

    // Music Player
    musicPlayer: "Pemutar Musik",
    nowPlaying: "Sedang diputar",
    musicLibrary: "Perpustakaan musik",
    filterByMood: "Filter berdasarkan suasana",
    all: "Semua",
    calming: "Menenangkan",
    uplifting: "Menggugah semangat",
    peaceful: "Damai",
    calmingClassicalMusic: "Musik klasik yang menenangkan untuk belajar",

    // Animals
    cat: "Kucing",
    bunny: "Kelinci",
    bear: "Beruang",
    dog: "Anjing",
    fox: "Rubah",
    panda: "Panda",
  },
};

// Language display names in their native script
export const languageNames: Record<Language, string> = {
  en: "English (UK)",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  zh: "简体中文",
  ja: "日本語",
  ar: "العربية",
  ko: "한국어",
  pt: "Português (BR)",
  hi: "हिन्दी",
  it: "Italiano",
  tr: "Türkçe",
  ru: "Русский",
  id: "Bahasa Indonesia",
};

// Merge base translations with extended translations
const mergedTranslations = mergeTranslations(translations);

export const useTranslation = (language: Language) => {
  const t = (key: string): string => {
    return mergedTranslations[language]?.[key] || mergedTranslations.en[key] || key;
  };

  return { t };
};

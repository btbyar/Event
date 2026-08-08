export type Locale = "en" | "mn";

export const locales: Locale[] = ["en", "mn"];
export const defaultLocale: Locale = "en";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "mn";
}

export type ImportErrorCode =
  | "missingName"
  | "unknownTable"
  | "invalidSeatNumber"
  | "seatTaken"
  | "duplicateSeatInFile"
  | "codeTaken"
  | "duplicateCodeInFile"
  | "codeInUse"
  | "seatInUse"
  | "unknownError"
  | "invalidRow";

export type ApiErrorCode =
  | "unauthorized"
  | "invalidRequest"
  | "eventNotFound"
  | "guestNotFound"
  | "networkError"
  | "unknownError";

export type PhotoErrorCode =
  | "unauthorized"
  | "invalidRequest"
  | "eventNotFound"
  | "photoNotFound"
  | "tooManyFiles"
  | "fileTooLarge"
  | "invalidFileType"
  | "noFaceDetected"
  | "cameraDenied"
  | "cameraUnavailable"
  | "invalidToken"
  | "tokenExpired"
  | "networkError"
  | "unknownError";

export interface Dictionary {
  common: {
    save: string;
    cancel: string;
    delete: string;
    loading: string;
    language: string;
    english: string;
    mongolian: string;
    signOut: string;
    allEvents: string;
    tryAgain: string;
    somethingWentWrong: string;
    guestsCount: (n: number) => string;
  };
  status: {
    DRAFT: string;
    ACTIVE: string;
    CLOSED: string;
    NOT_ARRIVED: string;
    ARRIVED: string;
    LATE: string;
  };
  nav: {
    overview: string;
    tables: string;
    guests: string;
    import: string;
    monitor: string;
    photos: string;
  };
  brand: {
    title: string;
  };
  login: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    signIn: string;
    signingIn: string;
    invalidCredentials: string;
  };
  dashboard: {
    heading: string;
    subheading: string;
    createEvent: string;
    eventName: string;
    eventNamePlaceholder: string;
    dateTime: string;
    location: string;
    locationPlaceholder: string;
    description: string;
    lateThreshold: string;
    status: string;
    createEventButton: string;
    yourEvents: string;
    noEventsYet: string;
  };
  eventOverview: {
    eventDetails: string;
    saveChanges: string;
    deleteEvent: string;
    deleteConfirm: (name: string) => string;
    guestQrCode: string;
    downloadQr: string;
    reports: string;
    exportExcel: string;
    exportPdf: string;
  };
  tables: {
    addTable: string;
    label: string;
    capacity: string;
    labelPlaceholder: string;
    addTableButton: string;
    tablesCount: (n: number) => string;
    noTablesYet: string;
    seatedCount: (seated: number, capacity: number) => string;
    save: string;
    delete: string;
    deleteConfirm: (label: string) => string;
  };
  guestsPage: {
    addGuest: string;
    fullName: string;
    phone: string;
    email: string;
    table: string;
    unassigned: string;
    seatNumber: string;
    invitationCode: string;
    invitationCodeAuto: string;
    addGuestButton: string;
    save: string;
    guestsCountTitle: (n: number) => string;
    noGuestsYet: string;
    delete: string;
    removeConfirm: (name: string) => string;
  };
  importPage: {
    step1Title: string;
    dropzoneText: string;
    dropzoneHint: string;
    step2Title: string;
    notMapped: string;
    columnFallback: (n: number) => string;
    step3Title: (n: number) => string;
    checkForErrors: string;
    checking: string;
    importButton: (n: number) => string;
    importing: string;
    mapNameFirst: string;
    missingNameRows: (n: number) => string;
    runCheckHint: string;
    validCount: (n: number) => string;
    errorCountText: (n: number) => string;
    tableHeaders: {
      name: string;
      phone: string;
      email: string;
      table: string;
      seat: string;
      code: string;
      status: string;
    };
    showingFirstRows: (shown: number, total: number) => string;
    importComplete: string;
    insertedCount: (n: number) => string;
    skippedCount: (n: number) => string;
    rowLabel: (row: number, reason: string) => string;
  };
  importErrors: Record<ImportErrorCode, (...params: (string | number)[]) => string>;
  monitor: {
    loading: string;
    failedToLoad: string;
    totalGuests: string;
    arrived: string;
    late: string;
    notArrived: string;
    byTable: string;
    tableCol: string;
    seatedCol: string;
    arrivedCol: string;
    noTablesYet: string;
    unassignedCount: (n: number) => string;
    recentCheckins: string;
    noCheckinsYet: string;
    lateBadge: string;
  };
  adminError: {
    message: string;
    tryAgain: string;
  };
  guestFlow: {
    invitedTo: string;
    searchLabel: string;
    searchPlaceholder: string;
    clearSearch: string;
    findSeat: string;
    searching: string;
    checkingIn: string;
    noMatchFound: string;
    matchedCount: (n: number) => string;
    tapYourName: string;
    notYouSearchAgain: string;
    endsIn: (hint: string) => string;
    welcomeBack: string;
    welcome: string;
    alreadyCheckedInSub: string;
    lateSub: string;
    onTimeSub: string;
    table: string;
    seat: string;
    checkedInStatus: (table: string, seat: string) => string;
    unassignedShort: string;
    viewMyPhotos: string;
  };
  photosAdmin: {
    title: string;
    subtitle: string;
    uploadZoneText: string;
    uploadZoneHint: string;
    uploading: (uploaded: number, total: number) => string;
    processingBadge: string;
    processedBadge: (n: number) => string;
    failedBadge: string;
    reprocessPending: string;
    reprocessing: string;
    deletePhoto: string;
    deletePhotoConfirmBody: string;
    deleteAllPhotos: string;
    deleteAllConfirmTitle: string;
    deleteAllConfirmBody: string;
    confirmDelete: string;
    cancel: string;
    noPhotosYet: string;
    photosCount: (n: number) => string;
    faceCount: (n: number) => string;
  };
  photoFlow: {
    introEyebrow: string;
    introTitle: string;
    introBody: string;
    privacyNote: string;
    comeBackNote: string;
    enableCamera: string;
    chooseFromGallery: string;
    positionFace: string;
    capture: string;
    retake: string;
    analyzing: string;
    noFaceTitle: string;
    noFaceBody: string;
    tryAgain: string;
    cameraDeniedTitle: string;
    cameraDeniedBody: string;
    cameraUnavailableTitle: string;
    cameraUnavailableBody: string;
    noMatchesTitle: string;
    noMatchesBody: string;
    matchesTitle: (n: number) => string;
    downloadPhoto: string;
    downloadAll: string;
    downloadingAll: string;
    startOver: string;
  };
  photoErrors: Record<PhotoErrorCode, string>;
  photoGallery: {
    tabMine: string;
    tabAll: string;
    loadMore: string;
    loading: string;
    noPhotosYet: string;
    selectedCount: (n: number) => string;
    downloadSelected: (n: number) => string;
    downloadingSelected: string;
  };
  notFoundPage: {
    title: string;
    message: string;
  };
  errorPage: {
    title: string;
    message: string;
    tryAgain: string;
  };
  apiErrors: Record<ApiErrorCode, string>;
  exports: {
    sheetName: string;
    name: string;
    table: string;
    seat: string;
    status: string;
    checkedInAt: string;
    phone: string;
    email: string;
    invitationCode: string;
    guestListAndAttendance: (count: number) => string;
  };
}

const en: Dictionary = {
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    loading: "Loading...",
    language: "Language",
    english: "English",
    mongolian: "Mongolian",
    signOut: "Sign out",
    allEvents: "All events",
    tryAgain: "Try again",
    somethingWentWrong: "Something went wrong.",
    guestsCount: (n) => `${n} guest${n === 1 ? "" : "s"}`,
  },
  status: {
    DRAFT: "Draft",
    ACTIVE: "Active",
    CLOSED: "Closed",
    NOT_ARRIVED: "Not arrived",
    ARRIVED: "Arrived",
    LATE: "Late",
  },
  nav: {
    overview: "Overview",
    tables: "Tables",
    guests: "Guests",
    import: "Import",
    monitor: "Monitor",
    photos: "Photos",
  },
  brand: {
    title: "Event Admin",
  },
  login: {
    title: "Admin Login",
    subtitle: "Sign in to manage your events.",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in...",
    invalidCredentials: "Invalid email or password.",
  },
  dashboard: {
    heading: "Your events",
    subheading: "Create and manage guest check-in for your events.",
    createEvent: "Create Event",
    eventName: "Event name",
    eventNamePlaceholder: "Jane & John's Wedding",
    dateTime: "Date & time",
    location: "Location",
    locationPlaceholder: "Grand Ballroom",
    description: "Description",
    lateThreshold: "Late threshold (minutes)",
    status: "Status",
    createEventButton: "Create event",
    yourEvents: "Your Events",
    noEventsYet: "No events yet. Create one above.",
  },
  eventOverview: {
    eventDetails: "Event Details",
    saveChanges: "Save changes",
    deleteEvent: "Delete event",
    deleteConfirm: (name) =>
      `Delete "${name}" and all its guests/tables? This cannot be undone.`,
    guestQrCode: "Guest QR Code",
    downloadQr: "Download QR",
    reports: "Reports",
    exportExcel: "Export guest list (Excel)",
    exportPdf: "Export guest list (PDF)",
  },
  tables: {
    addTable: "Add Table",
    label: "Label",
    capacity: "Capacity",
    labelPlaceholder: "Table 1",
    addTableButton: "Add table",
    tablesCount: (n) => `Tables (${n})`,
    noTablesYet: "No tables yet. Add one above.",
    seatedCount: (seated, capacity) => `${seated}/${capacity} seated`,
    save: "Save",
    delete: "Delete",
    deleteConfirm: (label) =>
      `Delete "${label}"? Guests assigned to it will become unassigned.`,
  },
  guestsPage: {
    addGuest: "Add Guest",
    fullName: "Full name",
    phone: "Phone",
    email: "Email",
    table: "Table",
    unassigned: "Unassigned",
    seatNumber: "Seat #",
    invitationCode: "Invitation code",
    invitationCodeAuto: "auto",
    addGuestButton: "Add guest",
    save: "Save",
    guestsCountTitle: (n) => `Guests (${n})`,
    noGuestsYet: "No guests yet. Add one above, or import from Excel.",
    delete: "Delete",
    removeConfirm: (name) => `Remove ${name}?`,
  },
  importPage: {
    step1Title: "Upload Excel file",
    dropzoneText: "Click to choose a file, or drag one here",
    dropzoneHint: ".xlsx, .xls, or .csv",
    step2Title: "Map columns",
    notMapped: "Not mapped",
    columnFallback: (n) => `Column ${n}`,
    step3Title: (n) => `Preview (${n} rows)`,
    checkForErrors: "Check for errors",
    checking: "Checking...",
    importButton: (n) => `Import ${n} guests`,
    importing: "Importing...",
    mapNameFirst: 'Map a "Full name" column before importing.',
    missingNameRows: (n) => `${n} row(s) are missing a name and will be skipped.`,
    runCheckHint:
      'Run "Check for errors" to validate table/seat/code conflicts before importing.',
    validCount: (n) => `${n} valid`,
    errorCountText: (n) => `${n} with errors`,
    tableHeaders: {
      name: "Name",
      phone: "Phone",
      email: "Email",
      table: "Table",
      seat: "Seat",
      code: "Code",
      status: "Status",
    },
    showingFirstRows: (shown, total) => `Showing first ${shown} of ${total} rows.`,
    importComplete: "Import complete",
    insertedCount: (n) => `${n} guest(s) imported successfully.`,
    skippedCount: (n) => `${n} row(s) skipped:`,
    rowLabel: (row, reason) => `Row ${row}: ${reason}`,
  },
  importErrors: {
    missingName: () => "Missing name",
    unknownTable: (label) => `Unknown table "${label}"`,
    invalidSeatNumber: (seat) => `Invalid seat number "${seat}"`,
    seatTaken: (seat) => `Seat ${seat} at that table is already assigned to another guest`,
    duplicateSeatInFile: (seat) =>
      `Duplicate seat ${seat} at that table used elsewhere in this file`,
    codeTaken: (code) => `Invitation code "${code}" is already in use`,
    duplicateCodeInFile: (code) =>
      `Duplicate invitation code "${code}" used elsewhere in this file`,
    codeInUse: () => "That invitation code is already in use.",
    seatInUse: () => "That seat is already assigned to another guest at this table.",
    unknownError: () => "Unknown error",
    invalidRow: () => "Invalid row",
  },
  monitor: {
    loading: "Loading...",
    failedToLoad: "Failed to load stats.",
    totalGuests: "Total Guests",
    arrived: "Arrived",
    late: "Late",
    notArrived: "Not Arrived",
    byTable: "By Table",
    tableCol: "Table",
    seatedCol: "Seated",
    arrivedCol: "Arrived",
    noTablesYet: "No tables yet.",
    unassignedCount: (n) => `${n} guest(s) not yet assigned to a table.`,
    recentCheckins: "Recent Check-ins",
    noCheckinsYet: "No check-ins yet.",
    lateBadge: "LATE",
  },
  adminError: {
    message: "Something went wrong.",
    tryAgain: "Try again",
  },
  guestFlow: {
    invitedTo: "You're invited to",
    searchLabel: "Your name or invitation code",
    searchPlaceholder: "Your name or invitation code",
    clearSearch: "Clear search",
    findSeat: "Find my seat",
    searching: "Searching…",
    checkingIn: "Checking you in…",
    noMatchFound:
      "No guest found with that name or code. Please check your spelling, or try your invitation code.",
    matchedCount: (n) => `${n} guest${n === 1 ? "" : "s"} matched. Please select your name.`,
    tapYourName: "A few guests matched — tap your name:",
    notYouSearchAgain: "Not you? Search again",
    endsIn: (hint) => `ends in ${hint}`,
    welcomeBack: "Welcome back,",
    welcome: "Welcome,",
    alreadyCheckedInSub: "You're already checked in — here's your seat again.",
    lateSub: "You're checked in — glad you made it!",
    onTimeSub: "You're checked in — thanks for joining us!",
    table: "Table",
    seat: "Seat",
    checkedInStatus: (table, seat) => `Checked in. Table ${table}, seat ${seat}.`,
    unassignedShort: "—",
    viewMyPhotos: "📸 Find my photos",
  },
  photosAdmin: {
    title: "Event Photos",
    subtitle: "Upload photos so guests can find themselves with a selfie.",
    uploadZoneText: "Click to choose photos, or drag them here",
    uploadZoneHint: "JPG, PNG, or WEBP — up to 12 at a time",
    uploading: (uploaded, total) => `Uploading ${uploaded}/${total}…`,
    processingBadge: "Processing…",
    processedBadge: (n) => `${n} face${n === 1 ? "" : "s"} found`,
    failedBadge: "Failed",
    reprocessPending: "Reprocess pending",
    reprocessing: "Reprocessing…",
    deletePhoto: "Delete",
    deletePhotoConfirmBody: "Delete this photo and its detected faces? This cannot be undone.",
    deleteAllPhotos: "Delete all photos",
    deleteAllConfirmTitle: "Delete all photos?",
    deleteAllConfirmBody:
      "This permanently deletes every uploaded photo and detected face for this event. Guests will no longer be able to find themselves. This cannot be undone.",
    confirmDelete: "Delete",
    cancel: "Cancel",
    noPhotosYet: "No photos yet. Upload some above.",
    photosCount: (n) => `Photos (${n})`,
    faceCount: (n) => `${n} face${n === 1 ? "" : "s"}`,
  },
  photoFlow: {
    introEyebrow: "Find yourself",
    introTitle: "Find your photos",
    introBody: "Take a selfie and we'll find every photo you're in from this event.",
    privacyNote: "Your selfie stays on your device — only used to find matches, never stored.",
    comeBackNote: "Bookmark this page — you can come back anytime to find and download your photos.",
    enableCamera: "Take a selfie",
    chooseFromGallery: "Choose from Gallery",
    positionFace: "Center your face in the circle",
    capture: "Take selfie",
    retake: "Retake",
    analyzing: "Looking for you…",
    noFaceTitle: "No face detected",
    noFaceBody: "We couldn't find a face in that photo. Make sure you're well-lit and try again.",
    tryAgain: "Try again",
    cameraDeniedTitle: "Camera access needed",
    cameraDeniedBody: "Please allow camera access in your browser settings to find your photos.",
    cameraUnavailableTitle: "Camera unavailable",
    cameraUnavailableBody: "We couldn't access a camera on this device.",
    noMatchesTitle: "No photos found yet",
    noMatchesBody: "We couldn't find you in any photos. Check back later — more may be added.",
    matchesTitle: (n) => `We found you in ${n} photo${n === 1 ? "" : "s"}`,
    downloadPhoto: "Download",
    downloadAll: "Download all",
    downloadingAll: "Preparing download…",
    startOver: "Take another selfie",
  },
  photoErrors: {
    unauthorized: "You need to sign in to do that.",
    invalidRequest: "That request wasn't valid.",
    eventNotFound: "Event not found.",
    photoNotFound: "Photo not found.",
    tooManyFiles: "Too many files at once — please upload in smaller batches.",
    fileTooLarge: "That file is too large.",
    invalidFileType: "Only JPG, PNG, or WEBP images are supported.",
    noFaceDetected: "No face detected.",
    cameraDenied: "Camera access was denied.",
    cameraUnavailable: "No camera is available on this device.",
    invalidToken: "Your session expired — please take a new selfie.",
    tokenExpired: "Your session expired — please take a new selfie.",
    networkError: "Can't reach the server. Check your connection and try again.",
    unknownError: "Something went wrong.",
  },
  photoGallery: {
    tabMine: "My photos",
    tabAll: "All photos",
    loadMore: "Load more",
    loading: "Loading photos…",
    noPhotosYet: "No photos uploaded yet. Check back later.",
    selectedCount: (n) => `${n} selected`,
    downloadSelected: (n) => `Download ${n} photo${n === 1 ? "" : "s"}`,
    downloadingSelected: "Preparing download…",
  },
  notFoundPage: {
    title: "We couldn't find that event",
    message:
      "This link or QR code may be outdated. Double-check with the event host, or scan the code again.",
  },
  errorPage: {
    title: "Something went wrong",
    message: "We couldn't load this page. Please try again in a moment.",
    tryAgain: "Try again",
  },
  apiErrors: {
    unauthorized: "You need to sign in to do that.",
    invalidRequest: "That request wasn't valid.",
    eventNotFound: "Event not found.",
    guestNotFound: "Guest not found.",
    networkError: "Can't reach the server. Check your connection and try again.",
    unknownError: "Something went wrong.",
  },
  exports: {
    sheetName: "Guests",
    name: "Name",
    table: "Table",
    seat: "Seat",
    status: "Status",
    checkedInAt: "Checked In At",
    phone: "Phone",
    email: "Email",
    invitationCode: "Invitation Code",
    guestListAndAttendance: (count) => `Guest List & Attendance (${count} guests)`,
  },
};

const mn: Dictionary = {
  common: {
    save: "Хадгалах",
    cancel: "Цуцлах",
    delete: "Устгах",
    loading: "Ачааллаж байна...",
    language: "Хэл",
    english: "Англи",
    mongolian: "Монгол",
    signOut: "Гарах",
    allEvents: "Бүх арга хэмжээ",
    tryAgain: "Дахин оролдох",
    somethingWentWrong: "Ямар нэг зүйл буруу боллоо.",
    guestsCount: (n) => `${n} зочин`,
  },
  status: {
    DRAFT: "Ноорог",
    ACTIVE: "Идэвхтэй",
    CLOSED: "Хаагдсан",
    NOT_ARRIVED: "Ирээгүй",
    ARRIVED: "Ирсэн",
    LATE: "Хоцорсон",
  },
  nav: {
    overview: "Тойм",
    tables: "Ширээ",
    guests: "Зочид",
    import: "Импорт",
    monitor: "Хяналт",
    photos: "Зураг",
  },
  brand: {
    title: "Арга хэмжээний удирдлага",
  },
  login: {
    title: "Админ нэвтрэх",
    subtitle: "Арга хэмжээгээ удирдахын тулд нэвтэрнэ үү.",
    email: "Имэйл",
    password: "Нууц үг",
    signIn: "Нэвтрэх",
    signingIn: "Нэвтэрч байна...",
    invalidCredentials: "Имэйл эсвэл нууц үг буруу байна.",
  },
  dashboard: {
    heading: "Таны арга хэмжээнүүд",
    subheading: "Арга хэмжээнийхээ зочны бүртгэлийг үүсгэж, удирдана уу.",
    createEvent: "Арга хэмжээ үүсгэх",
    eventName: "Арга хэмжээний нэр",
    eventNamePlaceholder: "Хурим, хурал, баяр гэх мэт",
    dateTime: "Огноо, цаг",
    location: "Байршил",
    locationPlaceholder: "Зочид буудлын танхим",
    description: "Тайлбар",
    lateThreshold: "Хоцролтын босго (минут)",
    status: "Төлөв",
    createEventButton: "Арга хэмжээ үүсгэх",
    yourEvents: "Таны арга хэмжээнүүд",
    noEventsYet: "Одоогоор арга хэмжээ алга байна. Дээрээс үүсгэнэ үү.",
  },
  eventOverview: {
    eventDetails: "Арга хэмжээний дэлгэрэнгүй",
    saveChanges: "Өөрчлөлтийг хадгалах",
    deleteEvent: "Арга хэмжээг устгах",
    deleteConfirm: (name) =>
      `"${name}"-г бүх зочид, ширээнүүдийн хамт устгах уу? Үүнийг буцаах боломжгүй.`,
    guestQrCode: "Зочны QR код",
    downloadQr: "QR татах",
    reports: "Тайлан",
    exportExcel: "Зочдын жагсаалт татах (Excel)",
    exportPdf: "Зочдын жагсаалт татах (PDF)",
  },
  tables: {
    addTable: "Ширээ нэмэх",
    label: "Нэр",
    capacity: "Багтаамж",
    labelPlaceholder: "Ширээ 1",
    addTableButton: "Ширээ нэмэх",
    tablesCount: (n) => `Ширээ (${n})`,
    noTablesYet: "Одоогоор ширээ алга байна. Дээрээс нэмнэ үү.",
    seatedCount: (seated, capacity) => `${seated}/${capacity} суусан`,
    save: "Хадгалах",
    delete: "Устгах",
    deleteConfirm: (label) =>
      `"${label}"-г устгах уу? Энэ ширээнд суусан зочид суудалгүй болно.`,
  },
  guestsPage: {
    addGuest: "Зочин нэмэх",
    fullName: "Овог нэр",
    phone: "Утас",
    email: "Имэйл",
    table: "Ширээ",
    unassigned: "Хуваарилагдаагүй",
    seatNumber: "Суудлын №",
    invitationCode: "Урилгын код",
    invitationCodeAuto: "автомат",
    addGuestButton: "Зочин нэмэх",
    save: "Хадгалах",
    guestsCountTitle: (n) => `Зочид (${n})`,
    noGuestsYet: "Одоогоор зочин алга байна. Дээрээс нэмэх эсвэл Excel-ээс импортлоно уу.",
    delete: "Устгах",
    removeConfirm: (name) => `${name}-г устгах уу?`,
  },
  importPage: {
    step1Title: "Excel файл байршуулах",
    dropzoneText: "Файл сонгохын тулд дарах эсвэл энд чирнэ үү",
    dropzoneHint: ".xlsx, .xls, эсвэл .csv",
    step2Title: "Баганыг тохируулах",
    notMapped: "Тохируулаагүй",
    columnFallback: (n) => `Багана ${n}`,
    step3Title: (n) => `Урьдчилан харах (${n} мөр)`,
    checkForErrors: "Алдаа шалгах",
    checking: "Шалгаж байна...",
    importButton: (n) => `${n} зочин импортлох`,
    importing: "Импортлож байна...",
    mapNameFirst: 'Импортлохын өмнө "Овог нэр" баганыг тохируулна уу.',
    missingNameRows: (n) => `${n} мөрөнд нэр байхгүй тул алгасагдана.`,
    runCheckHint:
      'Импортлохын өмнө ширээ/суудал/кодын зөрчлийг шалгахын тулд "Алдаа шалгах" товчийг дарна уу.',
    validCount: (n) => `${n} зөв`,
    errorCountText: (n) => `${n} алдаатай`,
    tableHeaders: {
      name: "Нэр",
      phone: "Утас",
      email: "Имэйл",
      table: "Ширээ",
      seat: "Суудал",
      code: "Код",
      status: "Төлөв",
    },
    showingFirstRows: (shown, total) => `Эхний ${shown} мөрийг харуулж байна (нийт ${total} мөрөөс).`,
    importComplete: "Импорт дууслаа",
    insertedCount: (n) => `${n} зочин амжилттай импортлогдлоо.`,
    skippedCount: (n) => `${n} мөр алгасагдлаа:`,
    rowLabel: (row, reason) => `${row}-р мөр: ${reason}`,
  },
  importErrors: {
    missingName: () => "Нэр байхгүй байна",
    unknownTable: (label) => `"${label}" нэртэй ширээ олдсонгүй`,
    invalidSeatNumber: (seat) => `"${seat}" буруу суудлын дугаар байна`,
    seatTaken: (seat) => `Тухайн ширээний ${seat}-р суудал өөр зочинд хуваарилагдсан байна`,
    duplicateSeatInFile: (seat) =>
      `Тухайн ширээний ${seat}-р суудал энэ файлд давхардсан байна`,
    codeTaken: (code) => `"${code}" урилгын код аль хэдийн ашиглагдсан байна`,
    duplicateCodeInFile: (code) => `"${code}" урилгын код энэ файлд давхардсан байна`,
    codeInUse: () => "Энэ урилгын код аль хэдийн ашиглагдсан байна.",
    seatInUse: () => "Энэ суудал тухайн ширээнд өөр зочинд хуваарилагдсан байна.",
    unknownError: () => "Тодорхойгүй алдаа",
    invalidRow: () => "Буруу мөр",
  },
  monitor: {
    loading: "Ачааллаж байна...",
    failedToLoad: "Статистик ачаалахад алдаа гарлаа.",
    totalGuests: "Нийт зочид",
    arrived: "Ирсэн",
    late: "Хоцорсон",
    notArrived: "Ирээгүй",
    byTable: "Ширээгээр",
    tableCol: "Ширээ",
    seatedCol: "Сууриулсан",
    arrivedCol: "Ирсэн",
    noTablesYet: "Одоогоор ширээ алга байна.",
    unassignedCount: (n) => `${n} зочин ширээнд хараахан хуваарилагдаагүй байна.`,
    recentCheckins: "Сүүлийн бүртгэлүүд",
    noCheckinsYet: "Одоогоор бүртгэл алга байна.",
    lateBadge: "ХОЦОРСОН",
  },
  adminError: {
    message: "Ямар нэг зүйл буруу боллоо.",
    tryAgain: "Дахин оролдох",
  },
  guestFlow: {
    invitedTo: "Таныг урьж байна",
    searchLabel: "Таны нэр эсвэл урилгын код",
    searchPlaceholder: "Таны нэр эсвэл урилгын код",
    clearSearch: "Хайлтыг цэвэрлэх",
    findSeat: "Суудлаа олох",
    searching: "Хайж байна…",
    checkingIn: "Бүртгэж байна…",
    noMatchFound:
      "Энэ нэр эсвэл кодоор зочин олдсонгүй. Бичсэн зөв эсэхээ шалгах эсвэл урилгын кодоо оруулж үзнэ үү.",
    matchedCount: (n) => `${n} зочин тохирлоо. Нэрээ сонгоно уу.`,
    tapYourName: "Хэд хэдэн зочин тохирлоо — нэрээ дарна уу:",
    notYouSearchAgain: "Та биш үү? Дахин хайх",
    endsIn: (hint) => `${hint}-ээр төгсдөг`,
    welcomeBack: "Тавтай морил,",
    welcome: "Тавтай морил,",
    alreadyCheckedInSub: "Та бүртгүүлсэн байна — суудлын мэдээллийг дахин харуулж байна.",
    lateSub: "Та бүртгүүллээ — ирсэнд тань баяртай байна!",
    onTimeSub: "Та бүртгүүллээ — оролцсонд баярлалаа!",
    table: "Ширээ",
    seat: "Суудал",
    checkedInStatus: (table, seat) => `Бүртгэгдлээ. Ширээ ${table}, суудал ${seat}.`,
    unassignedShort: "—",
    viewMyPhotos: "📸 Зургаа олох",
  },
  photosAdmin: {
    title: "Арга хэмжээний зургууд",
    subtitle: "Зочид сэлфи авч өөрсдийгөө олохын тулд зураг байршуулна уу.",
    uploadZoneText: "Зураг сонгохын тулд дарах эсвэл энд чирнэ үү",
    uploadZoneHint: "JPG, PNG, эсвэл WEBP — нэг удаад 12 хүртэл",
    uploading: (uploaded, total) => `${uploaded}/${total} байршуулж байна…`,
    processingBadge: "Боловсруулж байна…",
    processedBadge: (n) => `${n} царай олдлоо`,
    failedBadge: "Амжилтгүй",
    reprocessPending: "Дахин боловсруулах",
    reprocessing: "Дахин боловсруулж байна…",
    deletePhoto: "Устгах",
    deletePhotoConfirmBody: "Энэ зураг болон илрүүлсэн царайг устгах уу? Үүнийг буцаах боломжгүй.",
    deleteAllPhotos: "Бүх зургийг устгах",
    deleteAllConfirmTitle: "Бүх зургийг устгах уу?",
    deleteAllConfirmBody:
      "Энэ нь тухайн арга хэмжээний бүх байршуулсан зураг болон илрүүлсэн царайг бүрмөсөн устгана. Зочид цаашид өөрсдийгөө олох боломжгүй болно. Үүнийг буцаах боломжгүй.",
    confirmDelete: "Устгах",
    cancel: "Цуцлах",
    noPhotosYet: "Одоогоор зураг алга байна. Дээрээс байршуулна уу.",
    photosCount: (n) => `Зураг (${n})`,
    faceCount: (n) => `${n} царай`,
  },
  photoFlow: {
    introEyebrow: "Өөрийгөө олох",
    introTitle: "Зургаа олох",
    introBody: "Сэлфи авахад бид энэ арга хэмжээнээс таны орсон бүх зургийг олж өгнө.",
    privacyNote: "Таны сэлфи зөвхөн таны төхөөрөмж дээр үлдэнэ — зөвхөн тохирол хайхад ашиглагдаж, хэзээ ч хадгалагдахгүй.",
    comeBackNote: "Энэ хуудсыг хадгалж (bookmark) аваарай — та хүссэн үедээ буцаж ирж зургаа олж татаж авах боломжтой.",
    enableCamera: "Сэлфи авах",
    chooseFromGallery: "Галерейгаас сонгох",
    positionFace: "Царайгаа тойрог дотор байрлуулна уу",
    capture: "Сэлфи авах",
    retake: "Дахин авах",
    analyzing: "Таныг хайж байна…",
    noFaceTitle: "Царай илрээгүй",
    noFaceBody: "Тухайн зурагнаас царай олдсонгүй. Гэрэлтэй газар дахин оролдоно уу.",
    tryAgain: "Дахин оролдох",
    cameraDeniedTitle: "Камерын зөвшөөрөл шаардлагатай",
    cameraDeniedBody: "Зургаа олохын тулд хөтчийнхөө тохиргооноос камерын зөвшөөрөл өгнө үү.",
    cameraUnavailableTitle: "Камер боломжгүй байна",
    cameraUnavailableBody: "Энэ төхөөрөмж дээр камерт хандах боломжгүй байна.",
    noMatchesTitle: "Одоогоор зураг олдсонгүй",
    noMatchesBody: "Танийг ямар ч зурагнаас олсонгүй. Дараа дахин шалгана уу — илүү зураг нэмэгдэж магадгүй.",
    matchesTitle: (n) => `Таныг ${n} зурагнаас олллоо`,
    downloadPhoto: "Татах",
    downloadAll: "Бүгдийг татах",
    downloadingAll: "Бэлтгэж байна…",
    startOver: "Дахин сэлфи авах",
  },
  photoErrors: {
    unauthorized: "Үүнийг хийхийн тулд нэвтэрсэн байх шаардлагатай.",
    invalidRequest: "Хүсэлт буруу байна.",
    eventNotFound: "Арга хэмжээ олдсонгүй.",
    photoNotFound: "Зураг олдсонгүй.",
    tooManyFiles: "Нэг дор хэт олон файл байна — жижиг хэсгүүдээр байршуулна уу.",
    fileTooLarge: "Тухайн файл хэтэрхий том байна.",
    invalidFileType: "Зөвхөн JPG, PNG, эсвэл WEBP зургийг дэмждэг.",
    noFaceDetected: "Царай илрээгүй.",
    cameraDenied: "Камерын хандалтыг татгалзлаа.",
    cameraUnavailable: "Энэ төхөөрөмж дээр камер алга байна.",
    invalidToken: "Таны харилцан үйлдэл хугацаа дууссан — шинэ сэлфи авна уу.",
    tokenExpired: "Таны харилцан үйлдэл хугацаа дууссан — шинэ сэлфи авна уу.",
    networkError: "Серверт холбогдож чадсангүй. Холболтоо шалгаад дахин оролдоно уу.",
    unknownError: "Ямар нэг зүйл буруу боллоо.",
  },
  photoGallery: {
    tabMine: "Миний зураг",
    tabAll: "Бүх зураг",
    loadMore: "Дараагийн зургууд",
    loading: "Зургуудыг ачааллаж байна…",
    noPhotosYet: "Одоогоор зураг байршуулаагүй байна. Дараа дахин орж үзнэ үү.",
    selectedCount: (n) => `${n} зураг сонгосон`,
    downloadSelected: (n) => `${n} зургийг татах`,
    downloadingSelected: "Бэлтгэж байна…",
  },
  notFoundPage: {
    title: "Энэ арга хэмжээг олсонгүй",
    message:
      "Энэ холбоос эсвэл QR код хуучирсан байж магадгүй. Зохион байгуулагчтай холбогдох эсвэл кодыг дахин уншуулна уу.",
  },
  errorPage: {
    title: "Ямар нэг зүйл буруу боллоо",
    message: "Энэ хуудсыг ачаалж чадсангүй. Түр хүлээгээд дахин оролдоно уу.",
    tryAgain: "Дахин оролдох",
  },
  apiErrors: {
    unauthorized: "Үүнийг хийхийн тулд нэвтэрсэн байх шаардлагатай.",
    invalidRequest: "Хүсэлт буруу байна.",
    eventNotFound: "Арга хэмжээ олдсонгүй.",
    guestNotFound: "Зочин олдсонгүй.",
    networkError: "Серверт холбогдож чадсангүй. Холболтоо шалгаад дахин оролдоно уу.",
    unknownError: "Ямар нэг зүйл буруу боллоо.",
  },
  exports: {
    sheetName: "Зочид",
    name: "Нэр",
    table: "Ширээ",
    seat: "Суудал",
    status: "Төлөв",
    checkedInAt: "Бүртгүүлсэн цаг",
    phone: "Утас",
    email: "Имэйл",
    invitationCode: "Урилгын код",
    guestListAndAttendance: (count) => `Зочдын жагсаалт ба ирц (${count} зочин)`,
  },
};

export const dictionaries: Record<Locale, Dictionary> = { en, mn };

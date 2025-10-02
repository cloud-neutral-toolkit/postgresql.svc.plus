type CountTemplate = {
  singular: string
  plural: string
}

type ReleaseChannelMeta = {
  name: string
  description: string
}

type ReleaseChannelLabels = {
  label: string
  summaryPrefix: string
  stable: ReleaseChannelMeta
  beta: ReleaseChannelMeta
  develop: ReleaseChannelMeta
  badges: {
    stable: string
    beta: string
    develop: string
  }
}

type DownloadTranslation = {
  home: {
    title: string
    description: string
    stats: {
      categories: string
      collections: string
      files: string
    }
  }
  browser: {
    categoriesTitle: string
    allButton: string
    allHeading: string
    allDescription: string
    collectionDescription: string
    itemCount: CountTemplate
    empty: string
  }
  cardGrid: {
    sortUpdated: string
    sortName: string
    searchPlaceholder: string
    updatedLabel: string
    itemsLabel: string
  }
  listing: {
    notFound: string
    headingDescription: string
    stats: {
      subdirectories: string
      files: string
      lastUpdated: string
    }
    collectionsTitle: string
    collectionsCount: CountTemplate
    empty: string
    infoTitle: string
    infoPath: string
    infoSource: string
    infoNotice: string
  }
  fileTable: {
    sortName: string
    sortUpdated: string
    sortSize: string
    filterPlaceholder: string
    headers: {
      name: string
      size: string
      updated: string
      actions: string
    }
  }
  copyButton: {
    tooltip: string
  }
  breadcrumbRoot: string
}

type AuthHighlight = {
  title: string
  description: string
}

type AuthRegisterAlerts = {
  success: string
  passwordMismatch: string
  missingFields: string
  userExists: string
  usernameExists?: string
  invalidName?: string
  agreementRequired?: string
  invalidEmail: string
  weakPassword: string
  genericError: string
}

type AuthLoginAlerts = {
  registered: string
  missingCredentials: string
  invalidCredentials: string
  userNotFound?: string
  genericError: string
  passwordRequired?: string
  mfa?: {
    missing: string
    invalid: string
    invalidFormat?: string
    setupRequired?: string
    challengeFailed?: string
  }
}

type AuthRegisterTranslation = {
  badge: string
  title: string
  subtitle: string
  highlights: AuthHighlight[]
  bottomNote: string
  uuidNote: string
  form: {
    title: string
    subtitle: string
    fullName: string
    fullNamePlaceholder: string
    email: string
    emailPlaceholder: string
    password: string
    passwordPlaceholder: string
    confirmPassword: string
    confirmPasswordPlaceholder: string
    agreement: string
    terms: string
    submit: string
    submitting?: string
  }
  social: {
    title: string
    github: string
    wechat: string
  }
  loginPrompt: {
    text: string
    link: string
  }
  alerts: AuthRegisterAlerts
}

type AuthLoginTranslation = {
  badge: string
  title: string
  subtitle: string
  highlights: AuthHighlight[]
  bottomNote: string
  form: {
    title: string
    subtitle: string
    email: string
    emailPlaceholder: string
    password: string
    passwordPlaceholder: string
    remember: string
    submit: string
    mfa: {
      mode: string
      passwordAndTotp: string
      emailAndTotp: string
      codeLabel: string
      codePlaceholder: string
    }
  }
  forgotPassword: string
  social: {
    title: string
    github: string
    wechat: string
  }
  registerPrompt: {
    text: string
    link: string
  }
  alerts: AuthLoginAlerts
}

type AuthTranslation = {
  register: AuthRegisterTranslation
  login: AuthLoginTranslation
}

type UserCenterOverviewTranslation = {
  heading: string
  loading: string
  welcome: string
  guest: string
  uuidNote: string
  lockBanner: {
    title: string
    body: string
    action: string
    docs: string
    logout: string
  }
  cards: {
    uuid: {
      label: string
      description: string
      copy: string
      copied: string
    }
    username: {
      label: string
      description: string
    }
    email: {
      label: string
      description: string
    }
    mfa: {
      label: string
      description: string
      action: string
    }
  }
}

type UserCenterMfaTranslation = {
  title: string
  subtitle: string
  pendingHint: string
  enabledHint: string
  generate: string
  regenerate: string
  secretLabel: string
  uriLabel: string
  manualHint: string
  codeLabel: string
  codePlaceholder: string
  verify: string
  verifying: string
  successTitle: string
  successBody: string
  status: {
    issuedAt: string
    confirmedAt: string
  }
  state: {
    enabled: string
    pending: string
    disabled: string
  }
  qrLabel: string
  lockedMessage: string
  steps: {
    intro: string
    provision: string
    verify: string
  }
  actions: {
    help: string
    description: string
    logout: string
    docs: string
    docsUrl: string
    setup: string
  }
  error: string
}

type UserCenterTranslation = {
  overview: UserCenterOverviewTranslation
  mfa: UserCenterMfaTranslation
}

export type Translation = {
  hero: {
    title: string
    description: string
    start: string
    learn: string
  }
  featuresTitle: string
  featuresSubtitle: string
  openSourceTitle: string
  downloadTitle: string
  downloadSubtitle: string
  footerLinks: [string, string, string]
  nav: {
    openSource: {
      title: string
      features: string
      projects: string
      download: string
    }
    services: {
      title: string
      artifact: string
      cloudIac: string
      insight: string
      docs: string
    }
    account: {
      title: string
      register: string
      login: string
      demo: string
      welcome: string
      logout: string
      userCenter: string
    }
    releaseChannels: ReleaseChannelLabels
  }
  login: {
    title: string
    description: string
    usernameLabel: string
  passwordLabel: string
  submit: string
  success: string
  goHome: string
  missingUsername: string
  missingPassword: string
  missingTotp?: string
  invalidCredentials: string
  userNotFound: string
  genericError: string
    disclaimer: string
  }
  termsTitle: string
  termsPoints: string[]
  contactTitle: string
  download: DownloadTranslation
  auth: AuthTranslation
  userCenter: UserCenterTranslation
}

export const translations: Record<'en' | 'zh', Translation> = {
  en: {
    hero: {
      title: 'CloudNative Suite',
      description: 'Unified tools for building and managing your cloud native stack.',
      start: 'Get Started',
      learn: 'Learn More',
    },
    featuresTitle: 'Features',
    featuresSubtitle: 'Everything you need to build, ship and run applications',
    openSourceTitle: 'Open Source Projects',
    downloadTitle: 'Download',
    downloadSubtitle: 'Select your platform',
    footerLinks: ['Privacy Policy', 'Terms of Service', 'Contact Us'],
    nav: {
      openSource: {
        title: 'Open Source',
        features: 'Features',
        projects: 'Projects',
        download: 'Download',
      },
      services: {
        title: 'Services',
        artifact: 'Artifact / Mirror',
        cloudIac: 'Cloud IaC Catalog',
        insight: 'Insight Workbench',
        docs: 'Docs / Solutions',
      },
      account: {
        title: 'Account',
        register: 'Register',
        login: 'Login',
        demo: 'Demo',
        welcome: 'Welcome, {username}',
        logout: 'Sign out',
        userCenter: 'User Center',
      },
      releaseChannels: {
        label: 'Preview',
        summaryPrefix: 'Mode',
        stable: {
          name: 'Stable',
          description: 'Reliable production-ready experience.',
        },
        beta: {
          name: 'Beta',
          description: 'Early access to upcoming features for evaluation.',
        },
        develop: {
          name: 'Develop',
          description: 'Latest experimental changes and prototypes.',
        },
        badges: {
          stable: 'Stable',
          beta: 'Beta',
          develop: 'Dev',
        },
      },
    },
    login: {
      title: 'Account Login',
      description: 'Sign in to personalize your CloudNative Suite experience.',
      usernameLabel: 'Username',
      passwordLabel: 'Password',
      submit: 'Sign in',
      success: 'Welcome back, {username}! 🎉',
      goHome: 'Return to homepage',
      missingUsername: 'Please enter a username to continue.',
      missingPassword: 'Please enter your password or switch to email + authenticator mode.',
      missingTotp: 'Enter the verification code from your authenticator app.',
      invalidCredentials: 'Incorrect username or password. Please try again.',
      userNotFound: 'We could not find an account with that username.',
      genericError: 'We could not sign you in. Please try again later.',
      disclaimer: 'This demo login keeps your username in memory only to personalize navigation while you browse.',
    },
    termsTitle: 'Terms of Service',
    termsPoints: [
      'A free, open-source version for self-hosting on Windows, Linux, and macOS',
      'Affordable 1-on-1 consulting for technical setup',
      'A premium plan with cloud sync, mobile support, and device linking',
      'A future SaaS version for users who want one-click deployment with no setup required',
    ],
    contactTitle: 'Contact Us',
    download: {
      home: {
        title: 'Download Center',
        description: 'Browse offline packages, releases, and other curated resources hosted on dl.svc.plus.',
        stats: {
          categories: 'Top-level categories',
          collections: 'Resource collections',
          files: 'Files tracked',
        },
      },
      browser: {
        categoriesTitle: 'Categories',
        allButton: 'All resources',
        allHeading: 'All downloads',
        allDescription: 'Browse the complete catalog of offline packages, releases, and artifacts.',
        collectionDescription: 'Showing resources from the {{collection}} collection.',
        itemCount: {
          singular: '{{count}} item',
          plural: '{{count}} items',
        },
        empty: 'No downloadable resources found for this category yet.',
      },
      cardGrid: {
        sortUpdated: 'Sort by Updated',
        sortName: 'Sort by Name',
        searchPlaceholder: 'Search',
        updatedLabel: 'Updated:',
        itemsLabel: 'Items:',
      },
      listing: {
        notFound: 'Directory not found.',
        headingDescription: 'Explore downloads and artifacts available under the {{directory}} directory.',
        stats: {
          subdirectories: 'Subdirectories',
          files: 'Files',
          lastUpdated: 'Last updated',
        },
        collectionsTitle: 'Collections',
        collectionsCount: {
          singular: '{{count}} entry',
          plural: '{{count}} entries',
        },
        empty: 'This directory does not contain downloadable artifacts yet.',
        infoTitle: 'Directory info',
        infoPath: 'Path',
        infoSource: 'Source',
        infoNotice: 'Data sourced from dl.svc.plus.',
      },
      fileTable: {
        sortName: 'Name',
        sortUpdated: 'Updated',
        sortSize: 'Size',
        filterPlaceholder: 'Filter ext (.tar.gz)',
        headers: {
          name: 'Name',
          size: 'Size',
          updated: 'Updated',
          actions: 'Actions',
        },
      },
      copyButton: {
        tooltip: 'Copy link',
      },
      breadcrumbRoot: 'Download',
    },
    auth: {
      register: {
        badge: 'Create account',
        title: 'Join CloudNative Suite',

        subtitle: 'Bring open source tools and AI services together to craft your cloud native workspace.',

        highlights: [
          {
            title: 'Explore open source solutions',
            description: 'Deploy databases, monitoring, CI/CD, and observability stacks in one click—no more juggling installs.',
          },
          {
            title: 'Experience AI copilots online',
            description: 'Let AI troubleshoot issues, automate ops, generate scripts, and surface optimizations—like gaining a reliable teammate.',
          },
        ],
        bottomNote: 'Select only the capabilities you need—pay as you go.',
        uuidNote:
          'Every account receives a globally unique UUID. After registration, sign in to the user center to view and copy it for future integrations.',
        form: {
          title: 'Create your account',
          subtitle: 'Share a few details or continue with a social login.',
          fullName: 'Full name',
          fullNamePlaceholder: 'Ada Lovelace',
          email: 'Work email',
          emailPlaceholder: 'name@example.com',
          password: 'Password',
          passwordPlaceholder: 'At least 8 characters',
          confirmPassword: 'Confirm password',
          confirmPasswordPlaceholder: 'Re-enter your password',
          agreement: 'I agree to the',
          terms: 'terms & privacy policy',
          submit: 'Create account',
          submitting: 'Creating account…',
        },
        social: {
          title: 'Or continue with',
          github: 'Continue with GitHub',
          wechat: 'Continue with WeChat',
        },
        loginPrompt: {
          text: 'Already have an account?',
          link: 'Sign in',
        },
        alerts: {
          success: 'Account created successfully. Please sign in.',
          passwordMismatch: 'Passwords do not match.',
          missingFields: 'Please complete all required fields.',
          userExists: 'An account with this email already exists.',
          usernameExists: 'This username is already taken. Please choose another.',
          invalidName: 'Enter a valid name.',
          agreementRequired: 'You must accept the terms to continue.',
          invalidEmail: 'Enter a valid email address.',
          weakPassword: 'Your password must be at least 8 characters long.',
          genericError: 'We could not complete your registration. Please try again.',
        },
      },
      login: {
        badge: 'Secure login',
        title: 'Welcome back',
        subtitle: 'Access your projects and account settings from a single console.',
        highlights: [
          {
            title: 'Personalized dashboard',
            description: 'Resume your work with saved queries and deployment history.',
          },
          {
            title: 'Team spaces',
            description: 'Switch between organizations and environments with one click.',
          },
          {
            title: 'Adaptive security',
            description: 'Multi-factor prompts and IP policies keep threats away.',
          },
        ],
        bottomNote: 'Need help signing in? Email support@svc.plus for enterprise onboarding assistance.',
        form: {
          title: 'Sign in to your account',
          subtitle: 'Use the username and password you registered with.',
          email: 'Username',
          emailPlaceholder: 'your-username',
          password: 'Password',
          passwordPlaceholder: 'Enter your password',
          remember: 'Remember this device',
          submit: 'Sign in',
          mfa: {
            mode: 'Authentication method',
            passwordAndTotp: 'Password + authenticator code',
            emailAndTotp: 'Email + authenticator code',
            codeLabel: 'Authenticator code',
            codePlaceholder: '6-digit code from your authenticator',
          },
        },
        forgotPassword: 'Forgot password?',
        social: {
          title: 'Or continue with',
          github: 'Continue with GitHub',
          wechat: 'Continue with WeChat',
        },
        registerPrompt: {
          text: 'New to CloudNative Suite?',
          link: 'Create an account',
        },
        alerts: {
          registered: 'Registration complete. Sign in to continue.',
          missingCredentials: 'Enter your username or email and the authenticator code to continue.',
          invalidCredentials: 'Incorrect username or password. Please try again.',
          userNotFound: 'We could not find an account with that username.',
          genericError: 'We could not sign you in. Please try again later.',
          passwordRequired: 'Enter your password when signing in with a username.',
          mfa: {
            missing: 'Enter the verification code from your authenticator app.',
            invalid: 'The verification code is not valid. Try again.',
            invalidFormat: 'Enter the 6-digit code from your authenticator app.',
            setupRequired: 'Multi-factor authentication must be completed before accessing the console.',
            challengeFailed: 'We could not prepare the multi-factor challenge. Try again later.',
          },
        },
      },
    },
    userCenter: {
      overview: {
        heading: 'User Center',
        loading: 'Loading your personalized space…',
        welcome: 'Welcome back, {name}.',
        guest: 'Sign in to unlock your user center.',
        uuidNote: 'Your UUID uniquely identifies you across XControl services.',
        lockBanner: {
          title: 'Finish MFA setup',
          body: 'Complete multi-factor authentication to unlock every panel section.',
          action: 'Set up MFA',
          docs: 'View setup guide',
          logout: 'Sign out',
        },
        cards: {
          uuid: {
            label: 'UUID',
            description: 'This fingerprint ties every service action back to your account.',
            copy: 'Copy',
            copied: 'Copied',
          },
          username: {
            label: 'Username',
            description: 'System-facing credential for automation and teammates.',
          },
          email: {
            label: 'Email',
            description: 'Receive notifications and maintain a trusted identity chain.',
          },
          mfa: {
            label: 'Multi-factor authentication',
            description: 'Secure the console by pairing an authenticator app.',
            action: 'Manage MFA',
          },
        },
      },
      mfa: {
        title: 'Multi-factor authentication',
        subtitle: 'Bind Google Authenticator to finish securing your account.',
        pendingHint: 'Complete this step to unlock the user center and other console features.',
        enabledHint: 'Authenticator codes are now required for every sign-in.',
        generate: 'Generate setup key',
        regenerate: 'Regenerate key',
        secretLabel: 'Secret key',
        uriLabel: 'Authenticator link',
        manualHint: 'Scan the link with Google Authenticator or enter the key manually.',
        codeLabel: 'Verification code',
        codePlaceholder: 'Enter the 6-digit code',
        verify: 'Verify and enable',
        verifying: 'Verifying…',
        successTitle: 'Authenticator connected',
        successBody: 'Your account now requires an authenticator code at sign-in.',
        status: {
          issuedAt: 'Key generated at',
          confirmedAt: 'Enabled at',
        },
        state: {
          enabled: 'Enabled',
          pending: 'Pending setup',
          disabled: 'Not enabled',
        },
        qrLabel: 'Authenticator QR code',
        lockedMessage: 'Finish the binding flow before exploring other sections.',
        steps: {
          intro: 'Complete these two steps to secure your account:',
          provision: '1. Generate a secret and scan the QR code with Google Authenticator.',
          verify: '2. Enter the 6-digit verification code to enable MFA.',
        },
        actions: {
          help: 'Need help staying secure?',
          description: 'If you run into issues, sign out or review the setup documentation.',
          logout: 'Sign out',
          docs: 'View setup guide',
          docsUrl: '/docs/account-service-configuration/latest',
          setup: 'Resume setup',
        },
        error: 'We could not complete the request. Please try again.',
      },
    },
  },
  zh: {
    hero: {
      title: '云原生套件',
      description: '为构建和管理云原生环境提供统一工具',
      start: '开始使用',
      learn: '了解更多',
    },
    featuresTitle: '功能特性',
    featuresSubtitle: '助您轻松构建、交付和运行应用',
    openSourceTitle: '开源项目',
    downloadTitle: '下载',
    downloadSubtitle: '选择适合的平台',
    footerLinks: ['隐私政策', '服务条款', '联系我们'],
    nav: {
      openSource: {
        title: '开源项目',
        features: '功能特性',
        projects: '开源项目',
        download: '下载',
      },
      services: {
        title: '服务',
        artifact: 'Artifact / 镜像',
        cloudIac: 'Cloud IaC 编排',
        insight: 'Insight 工作台',
        docs: '文档 / 解决方案',
      },
      account: {
        title: '账户',
        register: '注册',
        login: '登录',
        demo: '演示',
        welcome: '欢迎，{username}',
        logout: '退出登录',
        userCenter: '用户中心',
      },
      releaseChannels: {
        label: '体验版本',
        summaryPrefix: '模式',
        stable: {
          name: '稳定',
          description: '推荐的默认体验。',
        },
        beta: {
          name: '测试',
          description: '提前体验即将上线的新功能。',
        },
        develop: {
          name: '开发',
          description: '预览仍在开发中的实验特性。',
        },
        badges: {
          stable: '稳定',
          beta: '测试',
          develop: '开发',
        },
      },
    },
    login: {
      title: '账户登录',
      description: '登录以获得个性化的 CloudNative Suite 体验。',
      usernameLabel: '用户名',
      passwordLabel: '密码',
      submit: '立即登录',
      success: '{username}，欢迎回来！🎉',
      goHome: '返回首页',
      missingUsername: '请输入用户名后再尝试登录。',
      missingPassword: '请输入密码，或切换为“邮箱 + 动态口令”模式。',
      missingTotp: '请输入动态验证码完成登录。',
      invalidCredentials: '用户名或密码不正确，请重试。',
      userNotFound: '未找到该用户名对应的账户。',
      genericError: '登录失败，请稍后再试。',
      disclaimer: '此演示登录仅会在浏览期间保留用户名，以便展示个性化的导航体验。',
    },
    termsTitle: '服务条款',
    termsPoints: [
      '提供在 Windows、Linux 和 macOS 上可自托管的免费开源版本',
      '提供经济实惠的 1 对 1 技术部署咨询服务',
      '提供带云同步、移动端支持和设备绑定的高级版计划',
      '未来将推出无需设置、一键部署的 SaaS 版本',
    ],
    contactTitle: '联系我们',
    download: {
      home: {
        title: '下载中心',
        description: '浏览托管于 dl.svc.plus 的离线安装包、发布版本和精选资源。',
        stats: {
          categories: '顶级分类',
          collections: '资源集合',
          files: '已收录文件',
        },
      },
      browser: {
        categoriesTitle: '分类',
        allButton: '全部资源',
        allHeading: '全部下载',
        allDescription: '浏览所有离线安装包、发布版本和制品。',
        collectionDescription: '当前展示 {{collection}} 分类下的资源。',
        itemCount: {
          singular: '{{count}} 项',
          plural: '{{count}} 项',
        },
        empty: '当前分类暂时没有可下载的资源。',
      },
      cardGrid: {
        sortUpdated: '按更新时间排序',
        sortName: '按名称排序',
        searchPlaceholder: '搜索',
        updatedLabel: '更新于：',
        itemsLabel: '数量：',
      },
      listing: {
        notFound: '未找到对应的目录。',
        headingDescription: '浏览 {{directory}} 目录下可用的下载内容和制品。',
        stats: {
          subdirectories: '子目录',
          files: '文件',
          lastUpdated: '最近更新',
        },
        collectionsTitle: '集合',
        collectionsCount: {
          singular: '{{count}} 个条目',
          plural: '{{count}} 个条目',
        },
        empty: '该目录暂时没有可下载的内容。',
        infoTitle: '目录信息',
        infoPath: '路径',
        infoSource: '来源',
        infoNotice: '数据来源于 dl.svc.plus。',
      },
      fileTable: {
        sortName: '名称',
        sortUpdated: '更新时间',
        sortSize: '大小',
        filterPlaceholder: '按后缀过滤（如 .tar.gz）',
        headers: {
          name: '名称',
          size: '大小',
          updated: '更新时间',
          actions: '操作',
        },
      },
      copyButton: {
        tooltip: '复制链接',
      },
      breadcrumbRoot: '下载',
    },
    auth: {
      register: {
        badge: '立即注册',
        title: '加入 CloudNative Suite',
        subtitle: '把开源工具和 AI 服务放到一起，打造属于你的云原生工作台。',

        highlights: [
          {
            title: '试试各种开源解决方案',
            description: '数据库、监控、CI/CD、可观测性……一键部署与体验，告别繁琐安装，不用再东找西找。',
          },
          {
            title: '在线体验 AI 帮手',
            description: '未来的 AI 不只是聊天机器人，它能帮你查问题、做运维、生成脚本，甚至提出优化建议。随时随地，像多了一个可靠的伙伴。',
          },
        ],
        bottomNote: '注册用户按需选择需要的功能，Pay AS GO。',
        uuidNote: '注册完成后，系统会为你分配一个全局唯一的 UUID，可在用户中心查看并复制，用于后续服务对接。',
        form: {
          title: '创建账号',
          subtitle: '填写基础信息，或选择社交账号直接注册。',
          fullName: '姓名',
          fullNamePlaceholder: '王小云',
          email: '邮箱',
          emailPlaceholder: 'name@example.com',
          password: '密码',
          passwordPlaceholder: '至少 8 位字符',
          confirmPassword: '确认密码',
          confirmPasswordPlaceholder: '请再次输入密码',
          agreement: '我已阅读并同意',
          terms: '服务条款与隐私政策',
          submit: '立即注册',
          submitting: '注册中…',
        },
        social: {
          title: '或选择以下方式',
          github: '使用 GitHub 注册',
          wechat: '使用微信注册',
        },
        loginPrompt: {
          text: '已经拥有账号？',
          link: '立即登录',
        },
        alerts: {
          success: '注册成功，请使用账号登录。',
          passwordMismatch: '两次输入的密码不一致。',
          missingFields: '请填写所有必填信息。',
          userExists: '该邮箱已注册，请直接登录。',
          usernameExists: '该用户名已被占用，请更换后重试。',
          invalidName: '请输入有效的姓名。',
          agreementRequired: '请先同意服务条款后再继续。',
          invalidEmail: '请输入有效的邮箱地址。',
          weakPassword: '密码长度至少需要 8 个字符。',
          genericError: '注册失败，请稍后重试。',
        },
      },
      login: {
        badge: '安全登录',
        title: '欢迎回来',
        subtitle: '在一个控制台中管理项目和账号设置。',
        highlights: [],
        bottomNote: '如需支持，请联系 manbuzhe2008@gmail.com。',
        form: {
          title: '登录账号',
          subtitle: '使用注册时的用户名和密码即可访问。',
          email: '用户名',
          emailPlaceholder: 'your-username',
          password: '密码',
          passwordPlaceholder: '请输入密码',
          remember: '记住这台设备',
          submit: '登录',
          mfa: {
            mode: '验证方式',
            passwordAndTotp: '密码 + 动态口令',
            emailAndTotp: '邮箱 + 动态口令',
            codeLabel: '动态验证码',
            codePlaceholder: '来自认证器的 6 位数字',
          },
        },
        forgotPassword: '忘记密码？',
        social: {
          title: '或继续使用',
          github: '使用 GitHub 登录',
          wechat: '使用微信登录',
        },
        registerPrompt: {
          text: '还没有账号？',
          link: '立即创建',
        },
        alerts: {
          registered: '注册成功，请登录后继续。',
          missingCredentials: '请输入用户名或邮箱，并填写动态验证码。',
          invalidCredentials: '用户名或密码错误，请重试。',
          userNotFound: '未找到该用户名对应的账户。',
          genericError: '暂时无法登录，请稍后再试。',
          passwordRequired: '使用用户名登录时需要输入密码。',
          mfa: {
            missing: '请输入动态验证码。',
            invalid: '动态验证码不正确，请重试。',
            invalidFormat: '请输入认证器生成的 6 位数字验证码。',
            setupRequired: '请先完成多因素认证绑定后再访问控制台。',
            challengeFailed: '暂时无法发起多因素验证，请稍后再试。',
          },
        },
      },
    },
    userCenter: {
      overview: {
        heading: '用户中心',
        loading: '正在加载你的专属空间…',
        welcome: '欢迎回来，{name}。',
        guest: '请登录后解锁属于你的用户中心。',
        uuidNote: 'UUID 是你在 XControl 中的唯一身份凭证，后续的所有服务都与它关联在一起。',
        lockBanner: {
          title: '完成多因素认证',
          body: '完成 MFA 绑定后即可访问所有控制台板块。',
          action: '立即设置',
          docs: '查看操作指引',
          logout: '退出登录',
        },
        cards: {
          uuid: {
            label: 'UUID',
            description: '这串指纹标识让平台中的每项服务都能准确识别你。',
            copy: '复制',
            copied: '已复制',
          },
          username: {
            label: '用户名',
            description: '面向系统与团队成员的登录凭据。',
          },
          email: {
            label: '邮箱',
            description: '用于接收通知、验证操作，并保持可信链路。',
          },
          mfa: {
            label: '多因素认证',
            description: '绑定认证器即可保护控制台访问。',
            action: '前往设置',
          },
        },
      },
      mfa: {
        title: '多因素认证',
        subtitle: '绑定 Google Authenticator，完成账号安全校验。',
        pendingHint: '启用多因素认证后即可访问用户中心和更多控制台功能。',
        enabledHint: '以后登录都需要输入动态验证码。',
        generate: '生成绑定密钥',
        regenerate: '重新生成密钥',
        secretLabel: '密钥',
        uriLabel: '认证链接',
        manualHint: '使用 Google Authenticator 扫描链接或手动输入密钥。',
        codeLabel: '动态验证码',
        codePlaceholder: '请输入 6 位数字验证码',
        verify: '验证并启用',
        verifying: '验证中…',
        successTitle: '认证器绑定成功',
        successBody: '以后登录时将需要动态验证码，账号更安全。',
        status: {
          issuedAt: '密钥生成时间',
          confirmedAt: '启用时间',
        },
        state: {
          enabled: '已启用',
          pending: '待验证',
          disabled: '未开启',
        },
        qrLabel: '认证二维码',
        lockedMessage: '请先完成绑定流程，再访问其他板块。',
        steps: {
          intro: '按照以下两步完成账号安全加固：',
          provision: '1. 生成密钥并在认证器中扫描二维码。',
          verify: '2. 输入认证器中的 6 位验证码完成启用。',
        },
        actions: {
          help: '需要帮助？',
          description: '遇到问题时可以退出重新登录，或查看绑定指引。',
          logout: '退出登录',
          docs: '查看操作指引',
          docsUrl: '/docs/account-service-configuration/latest',
          setup: '继续设置',
        },
        error: '操作失败，请稍后再试。',
      },
    },
  },
}

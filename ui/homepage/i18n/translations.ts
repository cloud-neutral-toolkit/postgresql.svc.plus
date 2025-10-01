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
      missingPassword: 'Please enter your password to continue.',
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
          missingCredentials: 'Please provide both your username and password.',
          invalidCredentials: 'Incorrect username or password. Please try again.',
          userNotFound: 'We could not find an account with that username.',
          genericError: 'We could not sign you in. Please try again later.',
        },
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
      missingPassword: '请输入密码后继续。',
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
        highlights: [
          {
            title: '个性化看板',
            description: '快速回到保存的查询、部署记录和常用操作。',
          },
          {
            title: '多团队空间',
            description: '一键切换不同组织与环境，协作更高效。',
          },
          {
            title: '自适应安全',
            description: '多因素验证与 IP 策略让访问更放心。',
          },
        ],
        bottomNote: '如需企业级接入支持，请联系 support@svc.plus。',
        form: {
          title: '登录账号',
          subtitle: '使用注册时的用户名和密码即可访问。',
          email: '用户名',
          emailPlaceholder: 'your-username',
          password: '密码',
          passwordPlaceholder: '请输入密码',
          remember: '记住这台设备',
          submit: '登录',
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
          missingCredentials: '请输入用户名和密码。',
          invalidCredentials: '用户名或密码错误，请重试。',
          userNotFound: '未找到该用户名对应的账户。',
          genericError: '暂时无法登录，请稍后再试。',
        },
      },
    },
  },
}

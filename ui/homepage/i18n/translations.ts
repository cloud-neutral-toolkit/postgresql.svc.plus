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
    disclaimer: string
  }
  termsTitle: string
  termsPoints: string[]
  contactTitle: string
  download: DownloadTranslation
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
  },
}

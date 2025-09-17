import type { CatalogItem, ProviderDefinition } from './types'

export const CATALOG: CatalogItem[] = [
  {
    key: 'compute',
    title: '计算',
    subtitle: 'Compute',
    products: {
      aws: 'Amazon EC2',
      gcp: 'Compute Engine',
      azure: 'Virtual Machines',
      aliyun: '弹性计算 ECS',
    },
    iac: {
      aws: {
        terraform: 'terraform-aws-modules/ec2-instance/aws',
        pulumi: 'aws.ec2.Instance',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'aws', target: 'ec2-instance' },
      },
      gcp: {
        terraform: 'terraform-google-modules/vm/google',
        pulumi: 'gcp.compute.Instance',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'gcp', target: 'compute-engine' },
      },
      azure: {
        terraform: 'Azure/avm-res-compute-virtualmachine/azurerm',
        pulumi: 'azure-native.compute.VirtualMachine',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'azure', target: 'virtual-machine' },
      },
      aliyun: {
        terraform: 'aliyun/alicloud//modules/ecs-instance',
        pulumi: 'alicloud.ecs.Instance',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'aliyun', target: 'ecs' },
      },
    },
  },
  {
    key: 'network',
    title: '网络',
    subtitle: 'Networking',
    products: {
      aws: 'Amazon VPC',
      gcp: 'Virtual Private Cloud',
      azure: 'Virtual Network',
      aliyun: '专有网络 VPC',
    },
    iac: {
      aws: {
        terraform: 'terraform-aws-modules/vpc/aws',
        pulumi: 'aws.ec2.Vpc',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'aws', target: 'vpc' },
      },
      gcp: {
        terraform: 'terraform-google-modules/network/google',
        pulumi: 'gcp.compute.Network',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'gcp', target: 'vpc' },
      },
      azure: {
        terraform: 'Azure/avm-res-network-virtualnetwork/azurerm',
        pulumi: 'azure-native.network.VirtualNetwork',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'azure', target: 'vnet' },
      },
      aliyun: {
        terraform: 'aliyun/alicloud//modules/vpc',
        pulumi: 'alicloud.vpc.Network',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'aliyun', target: 'vpc' },
      },
    },
  },
  {
    key: 'load_balancer',
    title: '负载均衡',
    subtitle: 'Load Balancing',
    products: {
      aws: 'Application Load Balancer',
      gcp: 'Cloud Load Balancing',
      azure: 'Azure Load Balancer',
      aliyun: '共享型 SLB',
    },
    iac: {
      aws: {
        terraform: 'terraform-aws-modules/alb/aws',
        pulumi: 'aws.elasticloadbalancingv2.LoadBalancer',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'aws', target: 'alb' },
      },
      gcp: {
        terraform: 'GoogleCloudPlatform/lb-http/google',
        pulumi: 'gcp.compute.ForwardingRule',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'gcp', target: 'load-balancer' },
      },
      azure: {
        terraform: 'Azure/avm-res-network-loadbalancer/azurerm',
        pulumi: 'azure-native.network.LoadBalancer',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'azure', target: 'load-balancer' },
      },
      aliyun: {
        terraform: 'aliyun/alicloud//modules/slb',
        pulumi: 'alicloud.slb.LoadBalancer',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'aliyun', target: 'slb' },
      },
    },
  },
  {
    key: 'object_storage',
    title: '对象存储',
    subtitle: 'Object Storage',
    products: {
      aws: 'Amazon S3',
      gcp: 'Cloud Storage',
      azure: 'Azure Blob Storage',
      aliyun: '对象存储 OSS',
    },
    iac: {
      aws: {
        terraform: 'terraform-aws-modules/s3-bucket/aws',
        pulumi: 'aws.s3.Bucket',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'aws', target: 's3' },
      },
      gcp: {
        terraform: 'terraform-google-modules/cloud-storage/google',
        pulumi: 'gcp.storage.Bucket',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'gcp', target: 'cloud-storage' },
      },
      azure: {
        terraform: 'Azure/avm-res-storage-storageaccount/azurerm',
        pulumi: 'azure-native.storage.StorageAccount',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'azure', target: 'storage-account' },
      },
      aliyun: {
        terraform: 'aliyun/alicloud//modules/oss',
        pulumi: 'alicloud.oss.Bucket',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'aliyun', target: 'oss' },
      },
    },
  },
  {
    key: 'relational_db',
    title: '关系型数据库',
    subtitle: 'Relational Database',
    products: {
      aws: 'Amazon RDS',
      gcp: 'Cloud SQL',
      azure: 'Azure Database',
      aliyun: '云数据库 RDS',
    },
    iac: {
      aws: {
        terraform: 'terraform-aws-modules/rds/aws',
        pulumi: 'aws.rds.Instance',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'aws', target: 'rds' },
      },
      gcp: {
        terraform: 'terraform-google-modules/sql-db/google',
        pulumi: 'gcp.sql.DatabaseInstance',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'gcp', target: 'cloud-sql' },
      },
      azure: {
        terraform: 'Azure/avm-res-database-postgresqlflexibleserver/azurerm',
        pulumi: 'azure-native.dbforpostgresql.Server',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'azure', target: 'database' },
      },
      aliyun: {
        terraform: 'aliyun/alicloud//modules/rds-instance',
        pulumi: 'alicloud.rds.Instance',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'aliyun', target: 'rds' },
      },
    },
  },
  {
    key: 'message_queue',
    title: '消息队列',
    subtitle: 'Messaging',
    products: {
      aws: 'Amazon SQS',
      gcp: 'Pub/Sub',
      azure: 'Azure Service Bus',
      aliyun: '消息服务 MNS',
    },
    iac: {
      aws: {
        terraform: 'terraform-aws-modules/sqs/aws',
        pulumi: 'aws.sqs.Queue',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'aws', target: 'sqs' },
      },
      gcp: {
        terraform: 'terraform-google-modules/pubsub/google',
        pulumi: 'gcp.pubsub.Topic',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'gcp', target: 'pubsub' },
      },
      azure: {
        terraform: 'Azure/avm-res-servicebus-namespace/azurerm',
        pulumi: 'azure-native.servicebus.Namespace',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'azure', target: 'servicebus' },
      },
      aliyun: {
        terraform: 'aliyun/alicloud//modules/mns-queue',
        pulumi: 'alicloud.mns.Queue',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'aliyun', target: 'mns' },
      },
    },
  },
  {
    key: 'kubernetes',
    title: '容器服务',
    subtitle: 'Kubernetes',
    products: {
      aws: 'Amazon EKS',
      gcp: 'Google Kubernetes Engine',
      azure: 'Azure Kubernetes Service',
      aliyun: '容器服务 ACK',
    },
    iac: {
      aws: {
        terraform: 'terraform-aws-modules/eks/aws',
        pulumi: 'aws.eks.Cluster',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'aws', target: 'eks' },
      },
      gcp: {
        terraform: 'terraform-google-modules/kubernetes-engine/google',
        pulumi: 'gcp.container.Cluster',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'gcp', target: 'gke' },
      },
      azure: {
        terraform: 'Azure/avm-res-containerservice-managedcluster/azurerm',
        pulumi: 'azure-native.containerservice.ManagedCluster',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'azure', target: 'aks' },
      },
      aliyun: {
        terraform: 'aliyun/alicloud//modules/ack-managed-kubernetes',
        pulumi: 'alicloud.cs.ManagedKubernetesCluster',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'aliyun', target: 'ack' },
      },
    },
  },
  {
    key: 'data_platform',
    title: '大数据 / 数据湖',
    subtitle: 'Data Platform',
    products: {
      aws: 'Amazon EMR',
      gcp: 'Dataproc',
      azure: 'Azure Synapse',
      aliyun: 'E-MapReduce',
    },
    iac: {
      aws: {
        terraform: 'terraform-aws-modules/emr-cluster/aws',
        pulumi: 'aws.emr.Cluster',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'aws', target: 'emr' },
      },
      gcp: {
        terraform: 'terraform-google-modules/dataproc/google',
        pulumi: 'gcp.dataproc.Cluster',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'gcp', target: 'dataproc' },
      },
      azure: {
        terraform: 'Azure/avm-res-analytics-synapseworkspace/azurerm',
        pulumi: 'azure-native.synapse.Workspace',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'azure', target: 'synapse' },
      },
      aliyun: {
        terraform: 'aliyun/alicloud//modules/emr-cluster',
        pulumi: 'alicloud.emr.Cluster',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'aliyun', target: 'emr' },
      },
    },
  },
  {
    key: 'iam',
    title: '身份与访问管理',
    subtitle: 'IAM',
    products: {
      aws: 'AWS IAM',
      gcp: 'Cloud IAM',
      azure: 'Azure Active Directory',
      aliyun: '访问控制 RAM',
    },
    iac: {
      aws: {
        terraform: 'terraform-aws-modules/iam/aws',
        pulumi: 'aws.iam.Role',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'aws', target: 'iam' },
      },
      gcp: {
        terraform: 'terraform-google-modules/iam/google',
        pulumi: 'gcp.projects.IAMMember',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'gcp', target: 'iam' },
      },
      azure: {
        terraform: 'Azure/avm-res-authorization-roleassignment/azurerm',
        pulumi: 'azure-native.authorization.RoleAssignment',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'azure', target: 'role-assignment' },
      },
      aliyun: {
        terraform: 'aliyun/alicloud//modules/ram-user',
        pulumi: 'alicloud.ram.Role',
        githubWorkflow: 'iac-apply.yml',
        githubInputs: { provider: 'aliyun', target: 'ram' },
      },
    },
  },
]

export const PROVIDERS: ProviderDefinition[] = [
  { key: 'aws', label: 'AWS' },
  { key: 'gcp', label: 'GCP' },
  { key: 'azure', label: 'Azure' },
  { key: 'aliyun', label: '阿里云' },
]

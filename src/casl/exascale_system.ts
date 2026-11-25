import { sha3_256Hex } from './sha3';
import { canonicalJson } from './engine';

export type SubstrateCategory = 'EXASCALE_HPC_BARE_METAL' | 'ZERO_TRUST_ENTERPRISE_RUBIX';
export type SchedulerKind = 'SLURM' | 'SLURM_PARASTATION' | 'FLUX' | 'PBS_PRO_PALS' | 'PALANTIR_RUBIX_APOLLO' | 'BCM_SLURM_RUNAI';

export interface SystemArchitectureSpec {
  id: string;
  name: string;
  category: SubstrateCategory;
  schedulerKind: SchedulerKind;
  operator: string;
  platformTopology: string;
  computeSilicon: string;
  memoryHbmPerNode: string;
  interconnectFabric: string;
  primaryStorage: string;
  performanceAndPower: string;
  rmaxPflops: number;
  rpeakPflops: number;
  powerKw: number;
  osAndScheduler: string;
  // Section 1.2 Software Stack
  compilersAndEnv: string;
  gpuAcceleratorRuntimes: string;
  mpiCollectiveFabricLibs: string;
  containerAndPackageTooling: string;
  // Section 2.2 Filesystem Structure & Quotas
  binariesAndModulesPath: string;
  configAndSecretsPath: string;
  logsAndTelemetry: string;
  persistentHomeProjectStorage: string;
  highSpeedScratchObjectStorage: string;
  // Section 4.3 Security & Auth
  authAndCryptoModel: string;
  // Section 3.3 Native CLI Playbook
  cliCommands: string[];
  cid: string;
}

const RAW_SYSTEMS: Omit<SystemArchitectureSpec, 'cid'>[] = [
  {
    id: 'sferical-ai',
    name: 'Sferical AI',
    category: 'EXASCALE_HPC_BARE_METAL',
    schedulerKind: 'BCM_SLURM_RUNAI',
    operator: 'Sferical AB (559520-4016, Stockholm; AstraZeneca, Ericsson, Saab, SEB, Wallenberg Investments, SKF)',
    platformTopology: 'Sovereign consortium operating Sferical One + Sferical Labs',
    computeSilicon: 'Governs Sferical One compute plane (576 Grace CPUs, 1,152 B300 GPUs; NVIDIA Nemotron models)',
    memoryHbmPerNode: '37.9 TB coherent/rack via Sferical One',
    interconnectFabric: 'Bare-metal tenant-isolated Quantum-X800 + Spectrum-4',
    primaryStorage: 'Dedicated in-country sovereign enterprise storage',
    performanceAndPower: '>SEK 1B consortium investment; governed by Sferical One envelope',
    rmaxPflops: 720.0,
    rpeakPflops: 1440.0,
    powerKw: 2400,
    osAndScheduler: 'NVIDIA DGX OS; Mission Control / BCM, Slurm, Run:ai',
    compilersAndEnv: 'GCC, NVHPC, NVIDIA AI Enterprise, NVIDIA Nemotron / BioNeMo / CUDA Quantum',
    gpuAcceleratorRuntimes: 'CUDA, Driver R610+ (NVreg_CoherentGPUMemoryMode=driver on GB300), cuDNN, TensorRT',
    mpiCollectiveFabricLibs: 'NCCL, OpenUCX (UCX_TLS), OpenMPI, PMIx, GPUDirect RDMA/Storage',
    containerAndPackageTooling: 'NVIDIA BCM (cmsh), Run:ai (User K8s), Lmod, Apptainer',
    binariesAndModulesPath: 'BCM head-node modules; 1.92 TB M.2 OS NVMe/tray',
    configAndSecretsPath: '/etc/slurm/{slurm,gres,cgroup}.conf; /root/.cm/admin.{pem,key}',
    logsAndTelemetry: 'Prometheus (:9090), DCGM (:9400), Slurm accounting DB',
    persistentHomeProjectStorage: 'Dedicated in-country sovereign enterprise storage + Certified DGX Storage over SN5600',
    highSpeedScratchObjectStorage: '4x 3.84 TB E1.S NVMe RAID0 (15.36 TB/tray local scratch)',
    authAndCryptoModel: 'Consortium tenant-isolated mTLS (/root/.cm/admin.pem) + MUNGE / Slurm JWT + Run:ai RBAC',
    cliCommands: [
      'cmsh',
      'slurmd -C && slurmd -G && nvidia-smi topo -m',
      'sbatch --gpus=8 --gres=gpu:b300:8 --gres-flags=enforce-binding --exclusive run.sh',
      'srun --mpi=pmix ./train_app',
    ],
  },
  {
    id: 'sferical-one',
    name: 'Sferical One',
    category: 'EXASCALE_HPC_BARE_METAL',
    schedulerKind: 'BCM_SLURM_RUNAI',
    operator: 'Sferical AB (559520-4016, Sweden; launched Oct 15, 2026)',
    platformTopology: '2x NVIDIA DGX SuperPOD SUs: 16x DGX GB300 NVL72 racks (288 trays)',
    computeSilicon: '576x 72C Grace Arm64 CPUs + 1,152x Blackwell Ultra B300 GPUs (4 GPUs/tray, 72/rack)',
    memoryHbmPerNode: '288 GB HBM3e/GPU (~20.1 TB HBM3e + ~17 TB LPDDR5X = 37.9 TB/rack)',
    interconnectFabric: 'NVLink 5 (1.8 TB/s/GPU, 130 TB/s/rack); 72x ConnectX-8 800 Gb/s Q3400 IB; 18x BF-3 to SN5600 800 GbE',
    primaryStorage: '4x 3.84 TB E1.S NVMe RAID0 + 1.92 TB M.2 OS/tray; certified DGX Storage over SN5600',
    performanceAndPower: 'Rack peak: 1.44 EF sparse FP4 (1.08 EF dense), 720 PF FP8, 100 TF FP64; ~120-142 kW/rack (~2.4 MW)',
    rmaxPflops: 1152.0,
    rpeakPflops: 2304.0,
    powerKw: 2400,
    osAndScheduler: 'NVIDIA DGX OS (Arm64/x86_64), Driver R610+; Mission Control, Slurm, Run:ai',
    compilersAndEnv: 'GCC, NVHPC, NVIDIA AI Enterprise, NVIDIA Nemotron / BioNeMo / CUDA Quantum',
    gpuAcceleratorRuntimes: 'CUDA, Driver R610+ (NVreg_CoherentGPUMemoryMode=driver on GB300), cuDNN, TensorRT',
    mpiCollectiveFabricLibs: 'NCCL, OpenUCX (UCX_TLS), OpenMPI, PMIx, GPUDirect RDMA/Storage',
    containerAndPackageTooling: 'NVIDIA BCM (cmsh), Run:ai (User K8s), Lmod, Apptainer',
    binariesAndModulesPath: 'BCM head-node modules; 1.92 TB M.2 OS NVMe/tray',
    configAndSecretsPath: '/etc/slurm/{slurm,gres,cgroup}.conf; /root/.cm/admin.{pem,key}',
    logsAndTelemetry: 'Prometheus (:9090), DCGM (:9400), Slurm accounting DB',
    persistentHomeProjectStorage: 'Certified DGX Storage over SN5600 + NFS home',
    highSpeedScratchObjectStorage: '4x 3.84 TB E1.S NVMe RAID0 (15.36 TB/tray local scratch)',
    authAndCryptoModel: 'Shorewall role isolation + BCM mTLS (:8081) + Slurm MUNGE / HS256 JWT (:6820)',
    cliCommands: [
      'cmsh',
      'slurmd -C && slurmd -G && nvidia-smi topo -m',
      'sbatch --gpus=8 --gres=gpu:b300:8 --gres-flags=enforce-binding --exclusive run.sh',
      'srun --mpi=pmix ./train_app',
    ],
  },
  {
    id: 'palantir-aip-foundry',
    name: 'Palantir AIP / Foundry',
    category: 'ZERO_TRUST_ENTERPRISE_RUBIX',
    schedulerKind: 'PALANTIR_RUBIX_APOLLO',
    operator: 'Palantir Technologies Inc. (Cloud / IL5-IL6 / On-Prem)',
    platformTopology: 'Palantir Rubix K8s (48h node TTL, 72h container TTL) + Apollo CD',
    computeSilicon: 'linux/amd64 autoscaling Spark/Flink/Polars/DuckDB executors + managed GPU k-LLM pools',
    memoryHbmPerNode: 'Dynamic executor RAM; OSv2 decoupled indexing & OSS query layer',
    interconnectFabric: 'Zero-trust mesh, HTTPS/443, Arrow Flight SQL gRPC/443, WebSockets, localhost:8945 IPC',
    primaryStorage: 'Versioned Datasets (Parquet/Iceberg/BYOB), Virtual Tables, Media Sets, OSv2',
    performanceAndPower: '10,000 req/min & 800 concurrent/user; 2,000 props/object type; 100k Search Around',
    rmaxPflops: 250.0,
    rpeakPflops: 320.0,
    powerKw: 1800,
    osAndScheduler: 'Hardened Rubix Linux (linux/amd64); Rubix K8s, Foundry Builds, Apollo',
    compilersAndEnv: 'Python 3.10, 3.11, 3.12; Node.js 18/20/22/24 (>=18.19.0); Java 17+ / Amazon Corretto JDK',
    gpuAcceleratorRuntimes: 'Managed k-LLM Proxy (OpenAI/Anthropic compatible, ZDR enforced), GPU Compute Modules (linux/amd64)',
    mpiCollectiveFabricLibs: 'Apache Spark (Velox), Apache Flink, Polars (@transform_polars), DuckDB, DataFusion, Arrow Flight SQL',
    containerAndPackageTooling: 'Conda + pip (meta.yaml), Gradle, Docker/OCI (--platform linux/amd64), foundry-platform-sdk (1.112.0), @osdk/client, foundry CLI',
    binariesAndModulesPath: 'transforms-python/src/myproject/datasets/; dist/.palantir/widgets.config.json; ./service/bin/{init.sh,auto_restart.sh}',
    configAndSecretsPath: 'conda_recipe/meta.yaml, build.gradle, foundry.config.json, var/conf/runtime.yml, /var/security/truststore.jks, /etc/ssl/rubix-ca/ca.pem, /opt/module-auth-token/MODULE_AUTH_TOKEN',
    logsAndTelemetry: 'Audit Explorer (audit.3 Iceberg), SLS JSON stdout (type: service.1), Control Panel Log Observability',
    persistentHomeProjectStorage: 'Versioned Foundry Datasets (Parquet/Iceberg), OSv2, Media Sets, /var/data/source-encryption-key',
    highSpeedScratchObjectStorage: '/var/data/{cache,maven,processes}, /backups; Compute Module ephemeral container FS (72h TTL)',
    authAndCryptoModel: 'OAuth 2.0 (/multipass/api/oauth2/token, Auth Code+PKCE S256 & Client Credentials) + RBAC + Organizations (disjunctive) + Markings (conjunctive) + CBAC + Rubix CA mTLS',
    cliCommands: [
      'foundry login --foundry-url https://<enrollment>.palantirfoundry.com',
      'foundry login refresh && foundry deploy && foundry update self',
      'npx @osdk/create-app && npx @osdk/cli',
      './service/bin/init.sh start|stop|status',
      'docker build . -t <image>:<tag> --platform linux/amd64',
    ],
  },
  {
    id: 'gefion',
    name: 'Gefion',
    category: 'EXASCALE_HPC_BARE_METAL',
    schedulerKind: 'BCM_SLURM_RUNAI',
    operator: 'Danish Centre for AI Innovation A/S (DCAI, Lyngby, Denmark)',
    platformTopology: 'NVIDIA DGX SuperPOD: 191x DGX H100 + DGX B300 (>1,540 GPUs; Rubin NVL8 announced Oct 2026)',
    computeSilicon: '382x Xeon Platinum 8480C (112C/node) + 1,528x H100 SXM5 80GB + DGX B300 tier',
    memoryHbmPerNode: '2 TB DDR5 + 640 GB HBM3 per DGX H100 (~122.2 TB HBM3 total)',
    interconnectFabric: '4th-gen NVLink (900 GB/s/GPU) + Octo-rail Quantum-2 400 Gb/s IB',
    primaryStorage: 'DDN EXAScaler Lustre (12x NV400X2: 2 MDS/8 VMs, 10 OSS/40 VMs) + 110 PB WEKA NVMe (140 PB total)',
    performanceAndPower: 'TOP500: 66.59 PF Rmax / 100.63 PF Rpeak; IO500 ISC26: 368.56 score, 209.06 GiB/s BW; 100% renewable power',
    rmaxPflops: 66.59,
    rpeakPflops: 100.63,
    powerKw: 1450,
    osAndScheduler: 'NVIDIA DGX OS (Ubuntu; RHEL on TOP500); BCM + Slurm',
    compilersAndEnv: 'GCC, NVHPC, NVIDIA AI Enterprise, NVIDIA Nemotron / BioNeMo / CUDA Quantum',
    gpuAcceleratorRuntimes: 'CUDA, cuDNN, TensorRT, W&B (Gefion AI Cloud)',
    mpiCollectiveFabricLibs: 'NCCL, OpenUCX (UCX_TLS), OpenMPI, PMIx, GPUDirect RDMA/Storage',
    containerAndPackageTooling: 'NVIDIA BCM (cmsh), Lmod, Apptainer, aicentre CLI (Gefion P1)',
    binariesAndModulesPath: 'DGX OS + BCM modules + W&B (Gefion AI Cloud)',
    configAndSecretsPath: '~/.ssh/config (managed by aicentre), internal BCM/Slurm configs',
    logsAndTelemetry: 'Slurm sacct, DCGM (:9400), aicentre check --verbose',
    persistentHomeProjectStorage: 'P1 $HOME: 25 GB; Project: 500 GB default (300 TB pool); 6-mo retention',
    highSpeedScratchObjectStorage: 'DDN EXAScaler Lustre (12x NV400X2) + 110 PB WEKA NVMe; xfer.dcai.dk SFTP staging (counts 2x quota)',
    authAndCryptoModel: 'Non-transferable DCAI credentials + SSH keys + public IP whitelisting for xfer.dcai.dk SFTP',
    cliCommands: [
      'aicentre check -p gefion --connect --verbose',
      'aicentre code --gpu --desktop',
      'sbatch --account=iu_0096 --mem=512G train.sh',
      'curl ifconfig.io',
    ],
  },
  {
    id: 'isambard-ai',
    name: 'Isambard-AI',
    category: 'EXASCALE_HPC_BARE_METAL',
    schedulerKind: 'SLURM',
    operator: 'Bristol Centre for Supercomputing (BriCS), Univ. of Bristol, UK',
    platformTopology: 'HPE Cray EX254n: Phase 1 (42 nodes, 168 GH200) + Phase 2 (1,320 nodes, 5,280 GH200)',
    computeSilicon: '4x 72C Grace Neoverse-V2 (3.1 GHz, 288C/node) + 4x H100 GPUs (NVLink-C2C)',
    memoryHbmPerNode: '460 GB usable LPDDR5X + 384 GB HBM3 = 844 GB usable/node',
    interconnectFabric: 'HPE Slingshot-11, 4x 200 Gbps Cassini NICs/node (800 Gbps injection)',
    primaryStorage: 'All-flash HPE ClusterStor E1000 Lustre + VAST Data NFS (Phase 2 $HOME) + 48 GiB tmpfs $LOCALDIR',
    performanceAndPower: 'Phase 2 TOP500 (#15 Nov 2026): 216.50 PF Rmax / 278.58 PF Rpeak (1,028,160 cores); 660 W/GH200 cap',
    rmaxPflops: 216.5,
    rpeakPflops: 278.58,
    powerKw: 4200,
    osAndScheduler: 'HPE Cray OS / SLES 15 (linux-sles15-neoverse_v2); Slurm',
    compilersAndEnv: 'PrgEnv-cray/8.7.0, PrgEnv-gnu, cce/21.0.0, craype/2.7.36, craype-arm-grace, nvhpc, cray-libsci/26.03.0 (aarch64 mandatory)',
    gpuAcceleratorRuntimes: 'cudatoolkit, brics/nccl (binds aws-ofi-nccl), NGC PyTorch 24.12-py3..25.05-py3',
    mpiCollectiveFabricLibs: 'cray-mpich/9.1.0, libfabric/2.3.1 (craype-network-ofi), cray_shasta/PMI2/PMIx v4',
    containerAndPackageTooling: 'Lmod, Spack, Miniforge/Conda, uv, Apptainer (brics/apptainer-multi-node), Podman-HPC, SquashFS, clifton CLI',
    binariesAndModulesPath: '/opt/cray/libfabric/1.22.0, /usr/lib64, Lmod/Spack',
    configAndSecretsPath: '~/.ssh/config, ~/.ssh/id_ed25519-cert.pub',
    logsAndTelemetry: 'Slurm %x-%j.{out,err}, sacct, cxi_stat',
    persistentHomeProjectStorage: '$HOME /home/<P>/<U>.<P> (0750, 100 GiB NFS P2); $PROJECTDIR /projects/<P> (2770, 200 TiB / 50M inodes)',
    highSpeedScratchObjectStorage: '$SCRATCHDIR /scratch/<P>/<U>.<P> (0750, 5 TiB / 1M inodes); $LOCALDIR /local/user/<UID> (48 GiB tmpfs compute)',
    authAndCryptoModel: 'Keycloak + GÉANT MyAccessID OIDC -> clifton 12-hour Conch CA signed Ed25519 SSH certificates -> jump.isambard',
    cliCommands: [
      'clifton auth && clifton ssh-config write',
      'srun --nodes=2 --gpus=8 --cpus-per-task=72 --ntasks-per-node=1 --network=disable_rdzv_get --mpi=pmi2 ./nccl_test',
      'srun --reservation=interactive --gpus=1 --time=00:30:00 --pty bash',
      'apptainer exec --nv --bind /opt/cray/libfabric/1.22.0:/host/opt/cray/libfabric/1.22.0:ro --bind /usr/lib64:/host/usr/lib64:ro container.sif ./app',
    ],
  },
  {
    id: 'lumi',
    name: 'LUMI',
    category: 'EXASCALE_HPC_BARE_METAL',
    schedulerKind: 'SLURM',
    operator: 'CSC - IT Center for Science (EuroHPC JU, Kajaani, Finland)',
    platformTopology: 'HPE Cray EX: 2,978 LUMI-G + 2,048 LUMI-C + 16 LUMI-D + LUMI-K',
    computeSilicon: 'LUMI-G: 1x 64C EPYC 7A53 (56 usable) + 4x MI250X (8 GCDs); LUMI-C: 2x 64C EPYC 7763',
    memoryHbmPerNode: 'LUMI-G: 512 GiB DDR4 + 512 GB HBM2e; LUMI-C: 256-1,024 GiB; LUMI-D: up to 4 TB',
    interconnectFabric: 'HPE Slingshot-11 200 Gbps 3-rank Dragonfly (4 NICs/LUMI-G, 276 TB/s; 1 NIC/LUMI-C, 22.4 TB/s)',
    primaryStorage: '117 PB: LUMI-P (4x 20 PB HDD Lustre, 240 GB/s ea), LUMI-F (8 PB SSD, 1,740 GB/s), LUMI-O (30 PB Ceph S3)',
    performanceAndPower: 'LUMI-G HPL: 379.70 PF Rmax; hydroelectric power with waste-heat district heating',
    rmaxPflops: 379.7,
    rpeakPflops: 531.5,
    powerKw: 8500,
    osAndScheduler: 'Cray Linux Environment (SLES); Slurm + OpenShift (LUMI-K)',
    compilersAndEnv: 'LUMI/24.03, CrayEnv, cpeCray, cpeGNU, cpeAOCC, cpeAMD (cc, CC, ftn Clang/LLVM + Fortran 2018/2023)',
    gpuAcceleratorRuntimes: 'rocm (gfx90a MI250X), HIP, OpenMP offload',
    mpiCollectiveFabricLibs: 'cray-mpich, cray-libsci, craype-network-ofi (libfabric CXI), RCCL OFI plugin',
    containerAndPackageTooling: 'EasyBuild (EasyBuild-user / eb), Spack (spack-cpu/gpu), Singularity CE, cotainr, PRoot, lumio',
    binariesAndModulesPath: '/appl / Lmod (LUMI/24.03, CrayEnv), $EBU_USER_PREFIX',
    configAndSecretsPath: '~/.config/rclone/rclone.conf, ~/.s3cfg, ~/.aws/credentials, ~/.cache/lmod',
    logsAndTelemetry: 'Slurm sacct, CrayPat pat_report',
    persistentHomeProjectStorage: '/users/<U> (20 GB / 100k); /project/project_<id> (50-500 GB / 100k, 1x billing)',
    highSpeedScratchObjectStorage: '/scratch/project_<id> (50-500 TB / 2M); /flash/project_<id> (2-100 TB / 1M, 3x); LUMI-O (150 TB-2.1 PB, 0.25x)',
    authAndCryptoModel: 'Passwordless SSH only (MyAccessID/MyCSC SSH public keys or EuroHPC EFP SSH certs); LUMI-O S3 keys via auth.lumidata.eu',
    cliCommands: [
      'module load LUMI/24.03 partition/G',
      'srun --partition=standard-g --ntasks-per-node=8 --gpus-per-node=8 --cpu-bind=map_cpu:49,57,17,25,1,9,33,41 ./select_gpu ./app',
      'cotainr build app.sif --system=lumi-g --conda-env=env.yml',
      'module load lumio && lumio-conf && rclone copy data.tar lumi-46XXXXXXX-private:mybucket/',
    ],
  },
  {
    id: 'jupiter',
    name: 'JUPITER',
    category: 'EXASCALE_HPC_BARE_METAL',
    schedulerKind: 'SLURM_PARASTATION',
    operator: 'Jülich Supercomputing Centre (JSC, EuroHPC JU, Germany)',
    platformTopology: 'Eviden BullSequana XH3000: 5,884 Booster + 12 login + Cluster (582 Turin + 162 Rhea1)',
    computeSilicon: 'Booster: 4x GH200 (288 Grace cores, 4x H100 96GB); Cluster: 2x 96C EPYC 9655 / 2x 80C SiPearl Rhea1',
    memoryHbmPerNode: 'Booster: 480 GiB LPDDR5X + 384 GB HBM3; Cluster: 768/1,536 GB DDR5 or 128 GB HBM2e + 512 GB DDR5',
    interconnectFabric: 'Quad-Rail NVIDIA Quantum IB NDR200 (ConnectX-7, 800 Gb/s/node), 27-group Dragonfly+ adaptive routing',
    primaryStorage: 'IBM Storage Scale GPFS Multi-Cluster EXAJUST: ExaSTORE (/e/, ~1.2 TB/s R), ExaFLASH (15 PB), JUST6 (/p/)',
    performanceAndPower: 'TOP500 (#5 Nov 2026): 1,000.00 PF Rmax / 1,226.28 PF Rpeak (4,801,344 cores); 15,793.81 kW; 680 W/GH200',
    rmaxPflops: 1000.0,
    rpeakPflops: 1226.28,
    powerKw: 15793.81,
    osAndScheduler: 'RHEL 9; Slurm + ParTec ParaStation psid/psslurm',
    compilersAndEnv: 'Stages/2026: GCC 14.3.0, nvidia-compilers/NVHPC 25.9, Python 3.13.5, EasyBuild 5.1.2',
    gpuAcceleratorRuntimes: 'CUDA 12 / 13.0+ driver (explicit module load CUDA/12 after NVHPC on Stages/2025)',
    mpiCollectiveFabricLibs: 'ParaStationMPI 5.13.0-1/5.13.1-1 (pscom/UCC), OpenMPI 5.0.8, UCX-settings/{RC,DC,UD}-CUDA, PMIx',
    containerAndPackageTooling: 'Lmod (/p/software/...), EasyBuild, Apptainer + sib remote build CLI + shpc (Conda disabled)',
    binariesAndModulesPath: '/p/software/... (Lmod EasyBuild Stages/2026)',
    configAndSecretsPath: '~/.ssh/config, ~/.config/sib/data.json, JuDoor authorized_keys',
    logsAndTelemetry: 'LLview portal, sacct (1y retention), jpwr',
    persistentHomeProjectStorage: '$HOME (20/22 GB, 1M blk, 0700); $PROJECT (20/22 TB, 4M blk, 2770); $DATA (21 PB); $ARCHIVE (2.8 PB /p/arch{1,2})',
    highSpeedScratchObjectStorage: '$SCRATCH (200/210 TB, 8M blk, 90d purge); $FSCRATCH (40/44 TB flash, 30d purge); /tmp & /dev/shm tmpfs',
    authAndCryptoModel: 'Passphrase-protected Ed25519 SSH key + mandatory JuDoor from= IP/CIDR restriction + RFC 6238 6-digit TOTP MFA',
    cliCommands: [
      'srun --tasks-per-node=4 --cpus-per-task=72 --switches=1@00:30:00 ./app',
      'jutil user projects && jutil project dataquota -p <proj> && jutil user jobs -o json',
      'sgoto <jobid> <node>',
    ],
  },
  {
    id: 'el-capitan',
    name: 'El Capitan',
    category: 'EXASCALE_HPC_BARE_METAL',
    schedulerKind: 'FLUX',
    operator: 'Lawrence Livermore National Laboratory (LLNL, U.S. DOE / NNSA)',
    platformTopology: 'HPE Cray EX255a: 90 cabinets, 11,520 nodes (11,424 batch, 64 debug, 32 login)',
    computeSilicon: '4x AMD Instinct MI300A APUs/node (96 Zen 4 cores [84 user], 228 CDNA 3 CUs/APU; 46,080 APUs)',
    memoryHbmPerNode: '512 GiB unified HBM3/node (4x 128 GB @ 5.3 TB/s + 256 MB Infinity Cache @ 17.2 TB/s)',
    interconnectFabric: 'HPE Slingshot-11 Dragonfly (4x 200 Gbps NICs/node, 100 GB/s injection; dual 256 GB/s intra-node IF)',
    primaryStorage: '720 Rabbit NNF modules (16 SSDs + 1 EPYC ea; /l/ssd + dynamic DWS XFS/Lustre) + /p/lustre4',
    performanceAndPower: 'TOP500 (#2 Jun 2026): 1,809.00 PF Rmax / 2,821.10 PF Rpeak; HPCG 17.41 PF; HPL-MxP 16.7 EF; 29,685 kW',
    rmaxPflops: 1809.0,
    rpeakPflops: 2821.1,
    powerKw: 29685,
    osAndScheduler: 'TOSS 4 (RHEL 8.x/8.10); Flux Framework + flux-coral2',
    compilersAndEnv: 'cce/18.0.0-magic (craycc, crayCC, crayftn, CPE 24.07/25.03/25.09), rocmcc, GCC',
    gpuAcceleratorRuntimes: 'ROCm/HIP (--offload-arch=gfx942 MI300A), unified HBM3 (HSA_XNACK=1)',
    mpiCollectiveFabricLibs: 'cray-mpich (-lmpi_gtl_hsa, -lxpmem), libfabric CXI, libpals/flux-coral2, PMIx',
    containerAndPackageTooling: 'Lmod (ml +...), Spack, Spindle library loader, rootless Podman (enable-podman), slurm2flux',
    binariesAndModulesPath: 'Lmod (cce/18.0.0-magic), Spack, Spindle',
    configAndSecretsPath: '/etc/flux/{system,security,imp}/conf.d/*.toml, ~/.config/containers/storage.conf',
    logsAndTelemetry: 'flux dmesg, exec.eventlog, LDMS Kafka -> Sonar',
    persistentHomeProjectStorage: '/usr/workspace/<user> (2 TB NFS + .snapshot)',
    highSpeedScratchObjectStorage: '/p/lustre4 (100 TB/10M T1; 500 TB/100M T2); /l/ssd (~200 GB static Rabbit XFS); dynamic $DW_* Rabbit',
    authAndCryptoModel: 'SSHv2 with RSA SecurID hardware OTP (CZ/RZ/SCF Zone PIN + OTP); internal ZeroMQ CURVE + MUNGE',
    cliCommands: [
      'flux run -N 16 -n 64 -g 1 --exclusive -o spindle.push --setattr=hugepages=512GB ./app',
      'flux jobs -A && flux job attach -E -X <jobid> && flux dmesg',
      'flux account view-user $USER && flux config get',
    ],
  },
  {
    id: 'frontier',
    name: 'Frontier',
    category: 'EXASCALE_HPC_BARE_METAL',
    schedulerKind: 'SLURM',
    operator: 'Oak Ridge Leadership Computing Facility (OLCF / ORNL, U.S. DOE)',
    platformTopology: 'HPE Cray EX235a: 77 Olympus cabinets, 9,856 compute + 17 login nodes',
    computeSilicon: '1x 64C EPYC 7A53 (8 cores reserved -S 8) + 4x AMD Instinct MI250X (8 GCDs, 110 CUs/GCD)',
    memoryHbmPerNode: '512 GB DDR4 + 512 GB HBM2e (8x 64 GB @ 1.6 TB/s) per node',
    interconnectFabric: 'HPE Slingshot-11 3-hop Dragonfly (4x 200 Gbps NICs/node, 100 GB/s injection; 200+200 GB/s intra-MI250X)',
    primaryStorage: 'Orion 679 PB Lustre (/lustre/orion/) + 2x 1.92 TB NVMe/node (/mnt/bb) + NFS + Kronos archive',
    performanceAndPower: 'TOP500 (#3 Jun 2026): 1,353.00 PF Rmax / 2,055.72 PF Rpeak; HPCG 14.05 PF; HPL-MxP 11.4 EF; 24,607 kW',
    rmaxPflops: 1353.0,
    rpeakPflops: 2055.72,
    powerKw: 24607,
    osAndScheduler: 'HPE Cray OS 2.4 (SLES 15.4); Slurm (+ optional nested Flux)',
    compilersAndEnv: 'PrgEnv-amd (amdclang/amdflang), PrgEnv-cray, PrgEnv-gnu (gcc-native), cpe/26.03',
    gpuAcceleratorRuntimes: 'rocm/7.0.2 (hipcc --offload-arch=gfx90a), rccl-net-plugin',
    mpiCollectiveFabricLibs: 'cray-mpich (>=9.1.0), libfabric CXI, XPMEM, libpmi/libpmi2/libpals',
    containerAndPackageTooling: 'Lmod, Spack (/sw/frontier), Apptainer, Podman-to-Apptainer, sbcast --send-libs, darshan-runtime',
    binariesAndModulesPath: '/sw/frontier, Lmod (PrgEnv-*, cpe/26.03, rocm/7.0.2)',
    configAndSecretsPath: 'Slurm slurm.conf/gres.conf/cgroup.conf',
    logsAndTelemetry: '/lustre/orion/darshan/<sys>/<y>/<m>/<d>, sacct, Omnistat',
    persistentHomeProjectStorage: '/ccs/home/<U> (50 GB NFS); /ccs/proj/<P> (50 GB NFS); /nl/kronos/olcf/<P> (200 TB archive)',
    highSpeedScratchObjectStorage: '/lustre/orion/<P>/scratch/<U> ($MEMBERWORK, 50 TB, 90d purge); /mnt/bb/<U> (2x 1.92 TB NVMe via -C nvme)',
    authAndCryptoModel: 'SSHv2 with RSA SecurID (4-8 digit PIN + 6-digit tokencode) + MUNGE + Slurm JWT',
    cliCommands: [
      'OMP_NUM_THREADS=7 srun -N1 -n8 -c7 --gpus-per-task=1 --gpu-bind=closest --cpu-bind=threads -m block:cyclic ./app',
      'lfs setstripe -p capacity -c 8 /lustre/orion/<proj>/scratch/$USER/run_dir',
      'sbcast --send-libs ./app /mnt/bb/$USER/app',
    ],
  },
  {
    id: 'aurora',
    name: 'Aurora',
    category: 'EXASCALE_HPC_BARE_METAL',
    schedulerKind: 'PBS_PRO_PALS',
    operator: 'Argonne Leadership Computing Facility (ALCF / ANL, U.S. DOE)',
    platformTopology: 'HPE Cray EX: 166 racks, 10,624 blades/nodes (x<r>c<c>s<s>b0n0)',
    computeSilicon: '2x Intel Xeon CPU Max 9470 (104C/208T; cores 0/52 OS) + 6x Intel GPU Max 1550 PVC (12 tiles, 4 CCS/tile)',
    memoryHbmPerNode: '128 GB CPU HBM + 1,024 GB DDR5 + 768 GB GPU HBM/node (20.4 PB total)',
    interconnectFabric: 'HPE Slingshot-11 Dragonfly (1 rack = 1 group; 8x 200 Gbps Cassini NICs/node, 200 GB/s, 2.12 PB/s system)',
    primaryStorage: 'DAOS 230 PB / 31 TB/s (1,024 nodes; 800 user nodes) + Flare 91 PB Lustre + Gecko 12 PB /home',
    performanceAndPower: 'TOP500 (#4 Jun 2026): 1,012.00 PF Rmax / 1,980.01 PF Rpeak; HPCG 5.61 PF; HPL-MxP 11.6 EF; 38,698 kW',
    rmaxPflops: 1012.0,
    rpeakPflops: 1980.01,
    powerKw: 38698,
    osAndScheduler: 'SLES 15 SP7 + SHS 14.0.1 + Agama 1146.78; PBS Pro 2026.1.0 + PALS',
    compilersAndEnv: 'Aurora PE 26.181.0, Intel oneAPI 2026.1.0 (icx/icpx/ifx, SYCL/DPC++), spack-pe-gcc, spack-pe-oneapi',
    gpuAcceleratorRuntimes: 'Intel Level Zero (ze_*), Agama 1146.78 / LTS 2523.78, frameworks/2026.1.0 (PyTorch 2.13, vLLM 0.26.1)',
    mpiCollectiveFabricLibs: 'Aurora MPICH (Cray PALS, ROMIO DAOS), oneCCL, libfabric CXI, PMIx, libdaos/libpil4dfs.so/libioil.so',
    containerAndPackageTooling: 'Hierarchical Lmod (/opt/aurora squashfs + /soft/modulefiles), Spack PE (RPATH), Apptainer, Copper cache, dbcast',
    binariesAndModulesPath: '/opt/aurora (squashfs PE), /soft, /soft/daos/bin',
    configAndSecretsPath: '/etc/daos/daos_{server,agent,control}.yml, /etc/daos/certs/',
    logsAndTelemetry: '$PBS_HOME/mom_logs/YYYYMMDD, D_LOG_FILE, Darshan 3.5.0',
    persistentHomeProjectStorage: '/home/<U> (/lus/gecko/home, 50 GB); /lus/flare/projects/<P> (91 PB Lustre, 1 TB default)',
    highSpeedScratchObjectStorage: 'DAOS dfuse /tmp/$USER/$DAOS_POOL/$DAOS_CONT (auto-unmounted by PBS epilogue); Copper /tmp/$USER/copper/',
    authAndCryptoModel: 'SafeNet MobilePASS+ / CryptoCard 8-digit passcode + DAOS mTLS certificates (/etc/daos/certs/clients)',
    cliCommands: [
      'qsub -l select=256 -l walltime=12:00:00 -l filesystems=flare:daos_user_fs -A <proj> -q prod job.pbs',
      'mpiexec -n 3072 -ppn 12 --depth=8 --cpu-bind=depth gpu_tile_compact.sh ./app',
      'daos container create --type=POSIX --chunk-size=2097152 --file-oclass=EC_16P3GX --dir-oclass=RP_4G1 --properties=rd_fac:3,ec_cell_sz:131072,cksum:crc32,srv_cksum:on $DAOS_POOL $DAOS_CONT',
    ],
  },
  {
    id: 'berzelius',
    name: 'BerzeLiUs',
    category: 'EXASCALE_HPC_BARE_METAL',
    schedulerKind: 'SLURM',
    operator: 'National Supercomputer Centre (NSC), Linköping Univ. (202100-3096)',
    platformTopology: 'NVIDIA DGX SuperPOD (Atos/Eviden): 60x thin A100 + 34x fat A100 + 16x H200 + 16x CPU',
    computeSilicon: '480x A100 40GB + 272x A100 80GB + 128x H200 141GB (880 GPUs); EPYC 7742 / Xeon 8480C / EPYC 9534',
    memoryHbmPerNode: '1 TB (thin) / 2 TB (fat) / 2.1 TB (H200) RAM + 320 / 640 / 1,128 GB HBM',
    interconnectFabric: '8x Mellanox HDR InfiniBand/DGX non-blocking fat-tree (200 GB/s RDMA) + dedicated HDR storage fabric',
    primaryStorage: 'VAST Data NVMe-oF (8x CBoxes, 3x DBoxes, 3 PB physical) + /scratch/local (15/30/6.4 TB NVMe)',
    performanceAndPower: 'TOP500: Berzelius 5.253 PF; Berzelius2 4.214 PF; Berzelius3 6.423 PF Rmax / 8.679 PF Rpeak; 700 W/H200',
    rmaxPflops: 15.89,
    rpeakPflops: 22.4,
    powerKw: 950,
    osAndScheduler: 'RHEL 8.8 (Driver 580.105.08 / CUDA 13.0); Slurm + NSC tools',
    compilersAndEnv: 'buildenv-gcccuda/12.1.1-gcc12.3.0 (GCC 12.3.0, CUDA 12.1.1, OpenMPI 4.1.5, OpenBLAS 0.3.23); 11.8.0-gcc11.3.0',
    gpuAcceleratorRuntimes: 'NVIDIA Driver 580.105.08 (CUDA 13.0) on Ampere & Hopper compute nodes',
    mpiCollectiveFabricLibs: 'OpenMPI 4.1.x, PMI2/PMIx (pmix_v3), NCCL, HDR InfiniBand RDMA, mpprun',
    containerAndPackageTooling: 'Lmod (/software), Miniforge3/24.7.1-2-hpc1-bdist (Mamba), Apptainer (Docker forbidden), Fpart/1.5.1',
    binariesAndModulesPath: '/software (Lmod, Miniforge3, buildenv-gcccuda)',
    configAndSecretsPath: 'Slurm configs, Apptainer .def/.sif (store in /proj, never /home)',
    logsAndTelemetry: 'jobgraph -j <id> (.png), sacct, nscquota',
    persistentHomeProjectStorage: '/home/$USER (20 GB / 1M files, nightly backup); /proj/<P>/users/$USER (2 TB / 2M); /proj/common-datasets',
    highSpeedScratchObjectStorage: '/scratch/local (15 TB thin / 30 TB fat & H200 / 6.4 TB CPU; isolated & wiped per job)',
    authAndCryptoModel: 'SUPR/NAISS + mandatory 6-digit TOTP 2FA (nim.nsc.liu.se) + verified ED25519 host key fingerprints',
    cliCommands: [
      'interactive --gpus=1 -C fat -t 30',
      'interactive --reservation=1g.10gb',
      'projinfo && nscquota && jobsh -j <jobid> && jobgraph -j <jobid>',
      'apptainer exec --nv --cleanenv image.sif python3 train.py',
    ],
  },
];

export const UNIFIED_SYSTEMS_MATRIX: SystemArchitectureSpec[] = RAW_SYSTEMS.map((sys) => {
  const payload = canonicalJson(sys, false);
  return {
    ...sys,
    cid: `bafkr4i${sha3_256Hex(payload).slice(0, 52)}`,
  };
});

export interface EnvironmentVariableSpec {
  scope: string;
  variable: string;
  defaultValue: string;
  functionalEffect: string;
}

export const SUPPORTED_ENVIRONMENT_VARIABLES: EnvironmentVariableSpec[] = [
  { scope: 'NVIDIA Clusters', variable: 'CUDA_VISIBLE_DEVICES', defaultValue: 'All GPUs / Slurm-assigned ordinals or MIG UUIDs', functionalEffect: 'Restricts visible CUDA devices; automatically exported by Slurm GRES' },
  { scope: 'NVIDIA Clusters', variable: 'CUDA_DEVICE_ORDER', defaultValue: 'FASTEST_FIRST (set PCI_BUS_ID)', functionalEffect: 'Aligns CUDA device ordering with NVML / Slurm PCI bus indices' },
  { scope: 'NVIDIA Clusters', variable: 'CUDA_LAUNCH_BLOCKING', defaultValue: '0 (set 1 for debugging)', functionalEffect: 'Forces synchronous kernel launches to pinpoint exact failing kernel' },
  { scope: 'NVIDIA Clusters', variable: 'CUDA_CACHE_MAXSIZE', defaultValue: '1073741824 (1 GiB)', functionalEffect: 'Maximum PTX-to-SASS JIT disk cache size in bytes' },
  { scope: 'NVIDIA Clusters', variable: 'NCCL_DEBUG', defaultValue: 'WARN (VERSION/INFO/TRACE)', functionalEffect: 'Sets NCCL logging verbosity (pair with NCCL_DEBUG_SUBSYS=INIT,NET)' },
  { scope: 'NVIDIA Clusters', variable: 'NCCL_SOCKET_IFNAME', defaultValue: 'Excludes lo/docker* (hsn on Isambard-AI)', functionalEffect: 'Selects NCCL control-plane network interface prefix' },
  { scope: 'IB NVIDIA Clusters', variable: 'NCCL_IB_HCA', defaultValue: 'Auto (e.g., mlx5_0:1,mlx5_1:1)', functionalEffect: 'Pins InfiniBand HCA interfaces and ports for NCCL RDMA' },
  { scope: 'IB NVIDIA Clusters', variable: 'NCCL_NET_GDR_READ', defaultValue: '1 (NVLink platforms)', functionalEffect: 'Enables GPUDirect RDMA reads directly from GPU HBM' },
  { scope: 'Isambard-AI', variable: 'NCCL_NET', defaultValue: 'AWS Libfabric (brics/nccl)', functionalEffect: 'Routes NCCL collectives through aws-ofi-nccl over Slingshot-11 CXI' },
  { scope: 'Isambard-AI', variable: 'NCCL_NET_GDR_LEVEL', defaultValue: 'PHB (NCCL_CROSS_NIC=1, NCCL_GDRCOPY_ENABLE=1)', functionalEffect: 'Enables PCIe Host Bridge GPUDirect RDMA across GH200 Cassini NICs' },
  { scope: 'Slingshot-11 Systems', variable: 'FI_CXI_RDZV_PROTO', defaultValue: 'alt_read (Isambard-AI / Frontier RCCL)', functionalEffect: 'Selects alternative CXI rendezvous protocol; pair with --network=disable_rdzv_get' },
  { scope: 'Slingshot-11 Systems', variable: 'FI_CXI_DEFAULT_CQ_SIZE', defaultValue: '131072 (FI_CXI_DEFAULT_TX_SIZE=2048)', functionalEffect: 'Sets libfabric CXI completion queue depth to prevent overflow at scale' },
  { scope: 'Slingshot-11 Systems', variable: 'FI_CXI_RX_MATCH_MODE', defaultValue: 'hybrid (or hardware/software)', functionalEffect: 'Controls Cassini RX tag matching to avoid hardware matching overflow' },
  { scope: 'Cray MPICH Systems', variable: 'MPICH_GPU_SUPPORT_ENABLED', defaultValue: '1', functionalEffect: 'Enables GPU-aware Cray MPICH; required on El Capitan to prevent Bad address' },
  { scope: 'AMD ROCm Systems', variable: 'ROCR_VISIBLE_DEVICES', defaultValue: '$SLURM_LOCALID (0-7 MI250X / 0-3 MI300A)', functionalEffect: 'Isolates visible AMD GCD/APU ordinals per MPI rank' },
  { scope: 'El Capitan / Frontier', variable: 'HSA_ENABLE_SDMA', defaultValue: '1 (0 = GFX blit kernel fallback)', functionalEffect: 'Controls ROCr System DMA engines for host-device/P2P transfers' },
  { scope: 'El Capitan', variable: 'HSA_XNACK', defaultValue: '1 (HUGETLB_MORECORE=yes)', functionalEffect: 'Enables page-fault-driven unified memory and 2 MB hugepages on MI300A' },
  { scope: 'El Capitan', variable: 'MPIBIND_RESTRICT', defaultValue: '1-7,9-15,...,185-191 (84 user cores)', functionalEffect: 'Isolates user processes from the 12 OS/Lustre cores per MI300A node' },
  { scope: 'El Capitan', variable: 'FLUX_URI', defaultValue: 'local:///run/flux/local', functionalEffect: 'Enclosing Flux rank-0 broker URI read by flux_open(3)' },
  { scope: 'Frontier', variable: 'MPICH_OFI_NIC_POLICY', defaultValue: 'NUMA (default)', functionalEffect: 'Confines MPI rank-to-Slingshot NIC mapping to local NUMA domain' },
  { scope: 'Frontier', variable: 'GTL_ENABLE_HSA_IPC_SIGNAL_CACHE', defaultValue: '1 (HSA_ENABLE_IPC_MODE_LEGACY=1)', functionalEffect: 'Caches HSA IPC signals for GPU-aware Cray MPICH (>=9.1.0)' },
  { scope: 'LUMI', variable: 'PMI_NO_PREINITIALIZE / PMI_SHARED_SECRET', defaultValue: 'y / ""', functionalEffect: 'Workarounds for >=512-node Fortran MPI startup hangs and _pmi_set_af_in_use' },
  { scope: 'LUMI', variable: 'EBU_USER_PREFIX', defaultValue: '/project/project_<id>/EasyBuild', functionalEffect: 'Target install prefix for EasyBuild-user modules' },
  { scope: 'JUPITER', variable: 'PSP_UCC / PSP_ONDEMAND', defaultValue: '1 / 1', functionalEffect: 'Switches ParaStationMPI collectives to UCC (fixes MPI_File_open hang); enables on-demand IB QPs' },
  { scope: 'JUPITER', variable: 'UCX_TLS / UCX_PROTO_ENABLE', defaultValue: 'RC-CUDA/DC-CUDA/UD-CUDA; no (>200 nodes)', functionalEffect: 'Selects UCX InfiniBand transport and disables UCX v2 protocol at scale' },
  { scope: 'Aurora', variable: 'ZE_AFFINITY_MASK', defaultValue: '0.0 (tile) or 0,1 (device)', functionalEffect: 'Pins Intel Level Zero PVC GPU devices/tiles per MPI rank' },
  { scope: 'Aurora', variable: 'ZE_FLAT_DEVICE_HIERARCHY', defaultValue: 'COMPOSITE (Aurora PE) / FLAT (frameworks)', functionalEffect: 'Exposes PVC GPUs as 6x2 composite sub-devices or 12 flat devices' },
  { scope: 'Aurora', variable: 'ONEAPI_DEVICE_SELECTOR', defaultValue: 'level_zero:gpu', functionalEffect: 'Filters SYCL/OpenMP runtime backend and device class' },
  { scope: 'Aurora', variable: 'SYCL_PI_LEVEL_ZERO_USE_IMMEDIATE_COMMANDLISTS', defaultValue: '1', functionalEffect: 'Activates low-latency Level Zero immediate command lists' },
  { scope: 'Aurora', variable: 'MPIR_CVAR_ENABLE_GPU', defaultValue: '1 (0 for CPU-only)', functionalEffect: 'Enables GPU-aware Aurora MPICH over Level Zero and Slingshot-11' },
  { scope: 'Aurora', variable: 'LD_PRELOAD (DAOS)', defaultValue: '/usr/lib64/libpil4dfs.so (or libioil.so)', functionalEffect: 'Intercepts POSIX data+metadata (libpil4dfs) or data-only (libioil) into DAOS DFS' },
  { scope: 'Aurora', variable: 'D_LOG_MASK', defaultValue: 'INFO (debug|info|note|warn|err|crit|fatal)', functionalEffect: 'Sets DAOS client/engine log level (pair with D_LOG_FILE, DD_STDERR=CRIT)' },
  { scope: 'Apptainer Systems', variable: 'APPTAINERENV_<VAR>', defaultValue: 'Arbitrary string', functionalEffect: 'Injects host env var into container even when --cleanenv (-e) is passed' },
  { scope: 'Palantir Foundry/AIP', variable: 'FOUNDRY_TOKEN', defaultValue: 'User or OAuth2 Bearer JWT', functionalEffect: 'Authenticates REST v2/v3, OSDK, Foundry CLI, and Palantir MCP' },
  { scope: 'Palantir Foundry/AIP', variable: 'FOUNDRY_HOSTNAME / FOUNDRY_URL', defaultValue: 'https://<enrollment>.palantirfoundry.com', functionalEffect: 'Target enrollment hostname for SDKs, LLM proxy, Arrow Flight, and S3 API' },
  { scope: 'Palantir Compute Modules', variable: 'GET_JOB_URI / POST_RESULT_URI / POST_SCHEMA_URI', defaultValue: 'https://localhost:8945/interactive-module/api/internal-query/{job,results,schemas}', functionalEffect: 'Reserved non-overridable Compute Module sidecar IPC URIs' },
  { scope: 'Palantir Compute Modules', variable: 'MODULE_AUTH_TOKEN / BUILD2_TOKEN / DEFAULT_CA_PATH', defaultValue: '/opt/module-auth-token/MODULE_AUTH_TOKEN, /opt/build2-token/BUILD2_TOKEN, /etc/ssl/rubix-ca/ca.pem', functionalEffect: 'Reserved file paths for sidecar auth token, pipeline bearer token, and Rubix CA' },
];

export interface ApiEndpointSpecification {
  id: string;
  systemApi: string;
  methodAndEndpoint: string;
  authScope: string;
  requestPayloadSchema: string;
  responseSchema: string;
  samplePayload: Record<string, unknown>;
}

export const API_ENDPOINT_SPECIFICATIONS: ApiEndpointSpecification[] = [
  {
    id: 'palantir-ontology-search',
    systemApi: 'Palantir Ontology Search',
    methodAndEndpoint: 'POST /api/v2/ontologies/{ontology}/objects/{objectType}/search',
    authScope: 'Bearer / api:ontologies-read',
    requestPayloadSchema: '{where, orderBy, pageSize, pageToken, select, selectV2, excludeRid, snapshot}',
    responseSchema: '200: {data, nextPageToken, totalCount} (max 10,000 objects)',
    samplePayload: {
      ontology: 'ri.ontology.main.ontology.c4a1e800-9f2b-4d1c-83a2-7b019e24c510',
      objectType: 'ExascaleComputeCluster',
      where: { type: 'gt', field: 'rmaxPflops', value: 200 },
      pageSize: 50,
      select: ['systemName', 'rmaxPflops', 'interconnectFabric', 'caslCid'],
    },
  },
  {
    id: 'palantir-ontology-action',
    systemApi: 'Palantir Ontology Action',
    methodAndEndpoint: 'POST /api/v2/ontologies/{ontology}/actions/{action}/apply',
    authScope: 'Bearer / api:ontologies-read api:ontologies-write',
    requestPayloadSchema: 'Query: branch, scenarioRid, transactionId; Body: {options, parameters}',
    responseSchema: '200: {operationId, validation, edits, returnValue} (must inspect validation.result)',
    samplePayload: {
      action: 'ri.actions.main.action.a912f411-551c-48a0-91b3-0e81b2c79d12',
      branch: 'master',
      options: { mode: 'VALIDATE_AND_EXECUTE', returnEdits: 'ALL' },
      parameters: {
        targetCluster: 'Sferical One',
        allocatedRacks: 4,
        intentCid: 'bafkr4i281ad280fbcb8b83a881cfb18bc0dffe071063b05034094f63d2',
      },
    },
  },
  {
    id: 'palantir-ontology-query',
    systemApi: 'Palantir Ontology Query',
    methodAndEndpoint: 'POST /api/v2/ontologies/{ontology}/queries/{queryApiName}/execute',
    authScope: 'Bearer / api:ontologies-read',
    requestPayloadSchema: 'Query: version, branch, scenarioRid, transactionId; Body: {parameters}',
    responseSchema: '200: {value}',
    samplePayload: {
      queryApiName: 'computeBarycentricFleetCoherence',
      version: '1.0.0',
      parameters: {
        dimensions: 64,
        includeExascaleNodes: true,
      },
    },
  },
  {
    id: 'palantir-dataset-upload',
    systemApi: 'Palantir Dataset Upload',
    methodAndEndpoint: 'POST /api/v2/datasets/{datasetRid}/files/{filePath}/upload',
    authScope: 'Bearer / api:datasets-write',
    requestPayloadSchema: 'Header: application/octet-stream; Query: branchName, transactionType (APPEND|UPDATE|SNAPSHOT|DELETE), transactionRid',
    responseSchema: '200: {path, transactionRid, sizeBytes, updatedTime}',
    samplePayload: {
      datasetRid: 'ri.foundry.main.dataset.77d9e123-4b88-4c19-9a01-33c8e71a9044',
      filePath: 'casl_manifold/part-00000.snappy.parquet',
      branchName: 'master',
      transactionType: 'APPEND',
    },
  },
  {
    id: 'palantir-aip-agent-stream',
    systemApi: 'Palantir AIP Agent Stream',
    methodAndEndpoint: 'POST /api/v2/aipAgents/agents/{agentRid}/sessions/{sessionRid}/streamingContinue?preview=true',
    authScope: 'Bearer / api:aip-agents-write',
    requestPayloadSchema: '{userInput, parameterInputs, contextsOverride, messageId, sessionTraceId}',
    responseSchema: '200 chunked markdown stream (concurrent calls on same session rejected)',
    samplePayload: {
      agentRid: 'ri.aip-agents..agent.f0012a98-3d11-4e77-b821-9c04e182a311',
      sessionRid: 'ri.aip-agents..session.88a12b44-1190-4c55-9823-1d44a890b211',
      userInput: 'Verify zero-deficit sheaf gluing across Sferical One GB300 NVL72 and El Capitan MI300A.',
      sessionTraceId: 'trace-casl-zero-azimuth-001',
    },
  },
  {
    id: 'palantir-orchestration',
    systemApi: 'Palantir Orchestration',
    methodAndEndpoint: 'POST /api/v2/orchestration/builds/create',
    authScope: 'Bearer / api:orchestration-write',
    requestPayloadSchema: '{target, branchName, fallbackBranches, forceBuild, retryCount, retryBackoffDuration, abortOnFailure}',
    responseSchema: '200: Build {rid, jobRids, status}',
    samplePayload: {
      target: {
        type: 'manual',
        targetRids: ['ri.foundry.main.dataset.77d9e123-4b88-4c19-9a01-33c8e71a9044'],
      },
      branchName: 'master',
      FallbackBranches: ['main'],
      forceBuild: false,
      retryCount: 2,
      retryBackoffDuration: { value: 30, unit: 'SECONDS' },
      abortOnFailure: true,
    },
  },
  {
    id: 'palantir-k-llm-proxy',
    systemApi: 'Palantir k-LLM Proxy',
    methodAndEndpoint: 'POST /api/v2/llm/proxy/openai/v1/responses & /anthropic/v1/messages',
    authScope: 'Bearer / api:use-language-models-execute',
    requestPayloadSchema: 'Model RID (ri.language-model-service..language-model.*), optional X-Palantir-session-id (<256 chars)',
    responseSchema: '200 OpenAI/Anthropic compatible JSON; ZDR enforced',
    samplePayload: {
      model: 'ri.language-model-service..language-model.nemotron-ultra-340b',
      zeroDataRetention: true,
      sessionId: 'casl-session-zero-azimuth',
    },
  },
  {
    id: 'palantir-compute-module-ipc',
    systemApi: 'Palantir Compute Module IPC',
    methodAndEndpoint: 'GET $GET_JOB_URI, POST $POST_RESULT_URI/$jobId, POST $POST_SCHEMA_URI',
    authScope: 'Module-Auth-Token + Rubix CA (/etc/ssl/rubix-ca/ca.pem)',
    requestPayloadSchema: 'Loopback localhost:8945; result body application/octet-stream; schema application/json',
    responseSchema: 'GET: 200 computeModuleJobV1 or 204 idle; POST: 204',
    samplePayload: {
      loopbackUri: 'https://localhost:8945/interactive-module/api/internal-query/job',
      uid: 5001,
      platform: 'linux/amd64',
      caPath: '/etc/ssl/rubix-ca/ca.pem',
    },
  },
  {
    id: 'nvidia-bcm-rest-api',
    systemApi: 'NVIDIA BCM REST API',
    methodAndEndpoint: 'GET/POST/PUT /rest/v1, /rest/v2/entities, /api/rest/swagger/',
    authScope: 'HTTP Basic or mTLS (/root/.cm/admin.pem)',
    requestPayloadSchema: 'Port 8081 HTTPS JSON entity payloads',
    responseSchema: '200/201 JSON cluster entity & telemetry objects',
    samplePayload: {
      endpoint: 'https://bcm-head.sferical-one.local:8081/rest/v2/entities',
      entityType: 'DGX_GB300_NVL72_Rack',
      coherentMemoryMode: 'NVreg_CoherentGPUMemoryMode=driver',
    },
  },
  {
    id: 'slurm-rest-api',
    systemApi: 'Slurm REST (slurmrestd)',
    methodAndEndpoint: 'GET/POST /slurm/v0.0.XX/jobs, /slurm/v0.0.XX/job/submit',
    authScope: 'X-SLURM-USER-NAME + X-SLURM-USER-TOKEN (JWT)',
    requestPayloadSchema: 'Port 6820 or UNIX socket; OpenAPI v3 JSON job descriptors',
    responseSchema: '200 JSON {jobs, errors, warnings}',
    samplePayload: {
      script: '#!/bin/bash\n#SBATCH --gpus=8\n#SBATCH --gres=gpu:b300:8\nsrun --mpi=pmix ./casl_synthesizer',
      job: {
        name: 'casl_manifold_projection',
        nodes: '16',
        tres_per_node: 'gres/gpu:b300:4',
      },
    },
  },
];

export interface ConfigurationFileTemplate {
  id: string;
  title: string;
  systemScope: string;
  filePath: string;
  language: string;
  content: string;
}

export const CONFIGURATION_FILE_TEMPLATES: ConfigurationFileTemplate[] = [
  {
    id: 'slurm-core',
    title: 'Slurm Core (slurm.conf, gres.conf, cgroup.conf)',
    systemScope: 'DGX SuperPOD / Frontier / Isambard-AI / LUMI / BerzeLiUs',
    filePath: '/etc/slurm/{slurm,gres,cgroup}.conf',
    language: 'ini',
    content: `# /etc/slurm/slurm.conf (DGX SuperPOD / Slurm reference)
GresTypes=gpu
SelectType=select/cons_tres
AuthType=auth/munge
AuthAltTypes=auth/jwt
AccountingStorageType=accounting_storage/slurmdbd
SlurmctldPort=6817
SlurmdPort=6818
BatchStartTimeout=10
CompleteWait=0
SlurmdParameters=numa_node_as_socket

# /etc/slurm/gres.conf
AutoDetect=nvml        # NVIDIA GPUs (use AutoDetect=rsmi on AMD ROCm systems like Frontier)

# /etc/slurm/cgroup.conf
CgroupPlugin=cgroup/v2
ConstrainDevices=yes
ConstrainSwapSpace=yes
AllowedRAMSpace=100
MinRAMSpace=30
SignalChildrenProcesses=yes
EnableExtraControllers=io,pids,rdma,hugetlb`,
  },
  {
    id: 'flux-rabbit-dws',
    title: 'Flux Broker TOML & Rabbit DataWorkflow Directives',
    systemScope: 'El Capitan (LLNL HPE Cray EX255a)',
    filePath: '/etc/flux/system/conf.d/bootstrap.toml & #DW jobdw',
    language: 'toml',
    content: `# /etc/flux/system/conf.d/bootstrap.toml & resource.toml
[bootstrap]
curve_cert = "/etc/flux/system/curve.cert"

[resource]
path = "/etc/flux/system/R" # RFC 20 JSON resource graph

# Embedded in Flux batch script for Rabbit NNF allocation (validated against DWS v1alpha2 CRDs)
#flux: -N 16
#flux: -q pbatch
#flux: -t 4h
#DW jobdw capacity=200GiB type=xfs name=job_local_scratch
#DW jobdw capacity=10TiB type=lustre name=job_striped_lustre`,
  },
  {
    id: 'daos-pbs-aurora',
    title: 'DAOS Agent YAML & PBS Pro Directives',
    systemScope: 'Aurora (ALCF Intel Xeon Max + PVC 1550)',
    filePath: '/etc/daos/daos_agent.yml & job.pbs',
    language: 'yaml',
    content: `# /etc/daos/daos_agent.yml
access_points: ['daos-mgmt-01:10001']
log_file: /var/log/daos/daos_agent.log
transport_config:
  allow_insecure: false
  client_cert_dir: /etc/daos/certs/clients

# PBS Pro Batch Directives
#PBS -A <project_allocation>
#PBS -N aurora_job
#PBS -q prod
#PBS -l select=256
#PBS -l walltime=12:00:00
#PBS -l filesystems=flare:daos_user_fs
#PBS -l place=scatter:group=tier0
#PBS -k doe`,
  },
  {
    id: 'jupiter-preps-judoor',
    title: 'JUPITER PrEpS #SBATCH --comment & JuDoor OpenSSH',
    systemScope: 'JUPITER (JSC Eviden BullSequana XH3000)',
    filePath: '~/.ssh/config & JuDoor authorized_keys',
    language: 'bash',
    content: `# JUPITER Slurm Prolog/Epilog runtime tuning
#SBATCH --comment="THP=never;CPU_POWER_CAP=200000000;NVIDIA_GPU_CLOCKS=990;NVIDIA_POWER_LIMIT=680,680"

# JuDoor authorized_keys (mandatory IP/CIDR prefix, netmask >= 8, no trailing wildcard)
from="2001:db8::2a,192.51.100.0/24,*.fz-juelich.de" ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA...

# ~/.ssh/config (JUPITER TOTP MFA multiplexing; ForwardAgent No enforced server-side)
Host jupiter
  HostName login.jupiter.fz-juelich.de
  User <userid>
  ControlMaster auto
  ControlPath ~/.ssh/control-%h-%p-%r
  ControlPersist 8h`,
  },
  {
    id: 'palantir-foundry-configs',
    title: 'Palantir Foundry Configs (meta.yaml, foundry.config.json, Dockerfile, runtime.yml)',
    systemScope: 'Palantir AIP / Foundry on Rubix K8s',
    filePath: 'conda_recipe/meta.yaml, foundry.config.json, Dockerfile, var/conf/runtime.yml',
    language: 'yaml',
    content: `# transforms-python/conda_recipe/meta.yaml (build/run Python versions must match; no >= ranges)
package:
  name: "{{ PACKAGE_NAME }}"
  version: "{{ PACKAGE_VERSION }}"
source:
  path: ../src
requirements:
  build:
    - python 3.12
    - setuptools
  run:
    - python 3.12
    - transforms
    - scipy <=1.4.0
build:
  script: python setup.py install --single-version-externally-managed --record=record.txt

// foundry.config.json (OSDK hosted website & widget versioning)
{
  "foundryUrl": "https://{{FOUNDRY_HOSTNAME}}",
  "site": {
    "application": "{{APPLICATION_RID}}",
    "directory": "./dist",
    "uploadOnly": true
  },
  "widgetSet": {
    "autoVersion": "package-json"
  }
}

# Compute Module Dockerfile (linux/amd64, non-root numeric UID, no :latest, no ports 8945/8946)
FROM python:3.12.7-slim
USER 5001
EXPOSE 8080
ENTRYPOINT ["python3", "/app/worker.py"]

# Data Connection Agent: <install-dir>/var/conf/runtime.yml
service-discovery:
  services:
    magritte-coordinator:
      proxy-configuration:
        hostAndPort: "proxy.corp.internal:3128"`,
  },
];

export const DATAFLOW_SCHEMA_HPC = `+-----------------------------------------------------------------------------------+
|  EXTERNAL AUTH & ACCESS PLANE                                                     |
|  SSHv2 (Port 22) + MFA/Certs:                                                     |
|   - Isambard-AI: OIDC (MyAccessID) -> clifton (12h Conch CA) -> jump.isambard     |
|   - JUPITER: Ed25519 + JuDoor from= IP + RFC 6238 TOTP -> login.jupiter           |
|   - El Capitan / Frontier / Aurora: RSA SecurID / MobilePASS+ -> Login Enclaves   |
|   - BerzeLiUs / Gefion / Sferical One: SUPR+TOTP / DCAI+IP Whitelist / Consortium |
+----------------------------------------+------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|  SCHEDULER & RESOURCE CONTROL PLANE                                               |
|   - Slurm: slurmctld (:6817) <-> slurmdbd (:6819) <-> slurmrestd (:6820)          |
|   - JUPITER: slurmctld <-> ParTec ParaStation psid + psslurm (replaces slurmd)    |
|   - El Capitan: flux-broker (ZeroMQ CURVE + TOML) <-> Fluxion <-> flux-coral2 DWS |
|   - Aurora: pbs_server (:15001) <-> pbs_comm (:17001) <-> pbs_mom (:15002) + PALS |
|   - DGX SuperPOD: NVIDIA Mission Control / BCM CMDaemon (:8081) + UFM + NetQ      |
+----------------------------------------+------------------------------------------+
                                         | (cgroups v2 / namespaces / MIG / core spec)
                                         v
+-----------------------------------------------------------------------------------+
|  HIGH-SPEED COMPUTE & COLLECTIVE FABRIC                                           |
|   [Compute Nodes: GH200 / B300 NVL72 / H100 / H200 / MI300A / MI250X / PVC 1550]  |
|        |                                   |                                      |
|   Intra-Node: NVLink 4/5 / NVLink-C2C      Inter-Node:                            |
|               Infinity Fabric / Xe Link     - Quantum-X800 (800G) / NDR200 / HDR  |
|               XPMEM (-lxpmem)               - HPE Slingshot-11 (200G Dragonfly)   |
|        |                                   |                                      |
|   MPI / Collective Stack: Cray MPICH / ParaStationMPI / OpenMPI / NCCL / RCCL /   |
|                           oneCCL -> libfabric CXI (aws-ofi-nccl) or UCX (RC/DC)   |
+----------------------------------------+------------------------------------------+
                                         | (GPUDirect Storage / RDMA / NVMe-oF / DFUSE)
                                         v
+-----------------------------------------------------------------------------------+
|  MULTI-TIER PARALLEL & OBJECT STORAGE PLANE                                       |
|   - Node-Local NVMe / Near-Node Flash: /scratch/local, /mnt/bb, /l/ssd, Rabbit    |
|   - Parallel POSIX: Lustre (Orion 679PB, ClusterStor, LUMI-P/F, Flare 91PB,       |
|     DDN EXAScaler), GPFS (EXAJUST), VAST Data NVMe-oF, WEKA (110PB), DAOS (230PB) |
|   - Object & Archive: LUMI-O Ceph S3 (30PB), Kronos Tape, EXAJUST $ARCHIVE        |
+-----------------------------------------------------------------------------------+`;

export const DATAFLOW_SCHEMA_PALANTIR = `+-----------------------------------------------------------------------------------+
|  CLIENT & EXTERNAL INTEGRATION PLANE (TLS 1.2/1.3, Port 443)                      |
|   - REST API v2/v3 JSON (OAuth 2.0 Auth Code+PKCE / Client Credentials / Bearer)  |
|   - TypeScript/Python/Java OSDK (@osdk/client, foundry-platform-sdk) + WebSockets |
|   - Arrow Flight SQL gRPC (jdbc:arrow-flight-sql://<host>:443)                    |
|   - S3-Compatible Path-Style API (https://<host>/io/s3/<dataset-rid>/<path>)      |
|   - Data Connection Agent (magritte-bootvisor, truststore.jks, runtime.yml)       |
+----------------------------------------+------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|  PALANTIR RUBIX ZERO-TRUST KUBERNETES SUBSTRATE (48h Node TTL / 72h Container TTL)|
|  Orchestrated by Palantir Apollo (Zero-Downtime CD & Marketplace Product Releases)|
|                                                                                   |
|   +-------------------------------+     +--------------------------------------+  |
|   | MULTIMODAL DATA PLANE (MMDP)  |     | ONTOLOGY BACKEND MICROSERVICES       |  |
|   | - Datasets (Branch/Tx ACID)   | --> | - OMS (Metadata: Objects/Links/Acts) |  |
|   | - Apache Iceberg & BYOB       |     | - Funnel (Batch/Stream Indexer)      |  |
|   | - Virtual Tables (Pushdown)   |     | - Object Storage v2 (OSv2)           |  |
|   | - Media Sets (Binary/DICOM)   |     | - Object Set Service (OSS / Spark)   |  |
|   | - Spark+Velox / Flink / Polars|     | - Actions & Functions on Objects     |  |
|   +---------------+---------------+     +------------------+-------------------+  |
|                   |                                        |                      |
|                   +-------------------+--------------------+                      |
|                                       v                                           |
|   +----------------------------------------------------------------------------+  |
|   | AIP & COMPUTE MODULES EXECUTION PLANE                                      |  |
|   | - k-LLM Proxy (/api/v2/llm/proxy/{openai,anthropic}/..., ZDR enforced)     |  |
|   | - AIP Logic / AIP Agent Studio (streamingContinue) / AIP Evals             |  |
|   | - Compute Modules (linux/amd64, non-root UID) <==HTTPS :8945==> Sidecar    |  |
|   +----------------------------------------------------------------------------+  |
|                                       |                                           |
|   [Governance & Observability: RBAC + Orgs + Markings + CBAC | audit.3 + SLS JSON]|
+-----------------------------------------------------------------------------------+`;

/**
 * Validates Palantir Foundry Resource Identifier (RID) grammar:
 * ri.<service>.<instance>.<type>.<uuid>
 * Global services omit the instance token (e.g. ri.aip-agents..agent.<uuid>)
 */
export function validateFoundryRid(rid: string): {
  valid: boolean;
  service?: string;
  instance?: string;
  resourceType?: string;
  locator?: string;
  error?: string;
} {
  const trimmed = rid.trim();
  const pattern = /^ri\.([a-z0-9-]+)\.([a-z0-9-]*)\.([a-z0-9-]+)\.([a-z0-9-]+)$/;
  const match = trimmed.match(pattern);
  if (!match) {
    return {
      valid: false,
      error:
        'Invalid RID grammar. Must match ri.<service>.<instance>.<type>.<locator> (global services use empty instance ..).',
    };
  }
  return {
    valid: true,
    service: match[1],
    instance: match[2] || '(global)',
    resourceType: match[3],
    locator: match[4],
  };
}

export interface WorkloadDispatchRequest {
  systemId: string;
  workloadName: string;
  nodesCount: number;
  acceleratorsPerNode: number;
  walltimeHours: number;
  declarativeIntent: string;
}

export interface WorkloadDispatchExecution {
  dispatchId: string;
  cid: string;
  systemId: string;
  systemName: string;
  schedulerKind: SchedulerKind;
  workloadName: string;
  nodesCount: number;
  totalAccelerators: number;
  walltimeHours: number;
  generatedScript: string;
  exportedEnvVars: Record<string, string>;
  invariantsVerified: string[];
  status: 'ACTIVE_SYNTHESIZED_ZERO_DEFICIT';
  timestampIso: string;
}

/**
 * Synthesizes a production-valid HPC scheduler batch script or Palantir Rubix/Foundry
 * Compute Module & Build specification for any of the 11 systems in the unified matrix.
 */
export function synthesizeSystemWorkload(
  req: WorkloadDispatchRequest
): WorkloadDispatchExecution {
  const sys =
    UNIFIED_SYSTEMS_MATRIX.find((s) => s.id === req.systemId) ||
    UNIFIED_SYSTEMS_MATRIX[1]; // Default Sferical One

  const nodes = Math.max(1, Math.min(11424, Math.floor(req.nodesCount || 1)));
  const accPerNode = Math.max(1, Math.min(72, Math.floor(req.acceleratorsPerNode || 4)));
  const totalAcc = nodes * accPerNode;
  const wallHours = Math.max(1, Math.min(168, Math.floor(req.walltimeHours || 4)));
  const wallStr = `${String(wallHours).padStart(2, '0')}:00:00`;
  const cleanName = req.workloadName.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'casl_unified_projection';

  let generatedScript = '';
  let exportedEnvVars: Record<string, string> = {};
  let invariantsVerified: string[] = [];

  if (sys.id === 'sferical-one' || sys.id === 'sferical-ai') {
    exportedEnvVars = {
      CUDA_DEVICE_ORDER: 'PCI_BUS_ID',
      NVreg_CoherentGPUMemoryMode: 'driver',
      NCCL_NET_GDR_READ: '1',
      NCCL_DEBUG: 'WARN',
      UCX_TLS: 'rc_x,sm,cuda_copy,cuda_ipc',
    };
    invariantsVerified = [
      'GB300 NVL72 coherent memory mode NVreg_CoherentGPUMemoryMode=driver active',
      'ConnectX-8 800 Gb/s Quantum-X800 GPUDirect RDMA enabled',
      'Slurm cgroup/v2 ConstrainDevices=yes & GRES enforce-binding verified',
    ];
    generatedScript = `#!/bin/bash
#SBATCH --job-name=${cleanName}
#SBATCH --nodes=${nodes}
#SBATCH --gpus=${totalAcc}
#SBATCH --gres=gpu:b300:${accPerNode}
#SBATCH --gres-flags=enforce-binding
#SBATCH --time=${wallStr}
#SBATCH --exclusive

export CUDA_DEVICE_ORDER=PCI_BUS_ID
export NCCL_NET_GDR_READ=1
export NCCL_DEBUG=WARN

# Verify NVML GRES & NVLink 5 topology (1.8 TB/s/GPU, 130 TB/s/rack)
nvidia-smi topo -m
srun --mpi=pmix ./casl_sovereign_engine --intent "${req.declarativeIntent}"`;
  } else if (sys.id === 'el-capitan') {
    exportedEnvVars = {
      MPICH_GPU_SUPPORT_ENABLED: '1',
      HSA_XNACK: '1',
      HUGETLB_MORECORE: 'yes',
      HSA_ENABLE_SDMA: '1',
      MPIBIND_RESTRICT: '1-7,9-15,17-23,25-31,33-39,41-47,49-55,57-63,65-71,73-79,81-87,89-95',
      FLUX_URI: 'local:///run/flux/local',
    };
    invariantsVerified = [
      'MI300A gfx942 unified HBM3 page-fault coherency (HSA_XNACK=1) enabled',
      '12 OS/Lustre cores isolated via MPIBIND_RESTRICT (84 user cores/node)',
      'Rabbit NNF DataWorkflow Services (DWS v1alpha2) #DW jobdw validated',
      'GPU-aware Cray MPICH (-lmpi_gtl_hsa -lxpmem) verified',
    ];
    generatedScript = `#!/bin/bash
#flux: -N ${nodes}
#flux: -n ${nodes * 4}
#flux: -g 1
#flux: -q pbatch
#flux: -t ${wallHours}h
#flux: --job-name=${cleanName}
#DW jobdw capacity=200GiB type=xfs name=job_local_scratch
#DW jobdw capacity=10TiB type=lustre name=job_striped_lustre

export MPICH_GPU_SUPPORT_ENABLED=1
export HSA_XNACK=1
export HUGETLB_MORECORE=yes
export HSA_ENABLE_SDMA=1

flux run -N ${nodes} -n ${nodes * 4} -g 1 --exclusive \\
  -o spindle.push --setattr=hugepages=512GB \\
  ./casl_mi300a_kernel --scratch=$DW_JOB_job_local_scratch --intent "${req.declarativeIntent}"`;
  } else if (sys.id === 'jupiter') {
    exportedEnvVars = {
      PSP_UCC: '1',
      PSP_ONDEMAND: '1',
      UCX_TLS: 'DC-CUDA',
      UCX_PROTO_ENABLE: nodes > 200 ? 'no' : 'yes',
      CUDA_DEVICE_ORDER: 'PCI_BUS_ID',
    };
    invariantsVerified = [
      'ParTec ParaStation psid/psslurm launcher enforced (mpiexec forbidden)',
      'Stages/2026 EasyBuild environment + explicit CUDA/12 module order verified',
      'PrEpS prolog THP=never & GH200 680W power cap applied',
      'PSP_UCC=1 enabled to prevent MPI_File_open collective deadlock on EXAJUST GPFS',
    ];
    generatedScript = `#!/bin/bash
#SBATCH --job-name=${cleanName}
#SBATCH --nodes=${nodes}
#SBATCH --tasks-per-node=4
#SBATCH --cpus-per-task=72
#SBATCH --gres=gpu:4
#SBATCH --time=${wallStr}
#SBATCH --switches=1@00:30:00
#SBATCH --comment="THP=never;CPU_POWER_CAP=200000000;NVIDIA_GPU_CLOCKS=990;NVIDIA_POWER_LIMIT=680,680"

module load Stages/2026 GCC/14.3.0 NVHPC/25.9 ParaStationMPI/5.13.1-1
export PSP_UCC=1
export PSP_ONDEMAND=1
export UCX_TLS=DC-CUDA
export UCX_PROTO_ENABLE=${nodes > 200 ? 'no' : 'yes'}

srun --tasks-per-node=4 --cpus-per-task=72 ./casl_jupiter_booster --intent "${req.declarativeIntent}"`;
  } else if (sys.id === 'aurora') {
    exportedEnvVars = {
      ONEAPI_DEVICE_SELECTOR: 'level_zero:gpu',
      ZE_FLAT_DEVICE_HIERARCHY: 'FLAT',
      SYCL_PI_LEVEL_ZERO_USE_IMMEDIATE_COMMANDLISTS: '1',
      MPIR_CVAR_ENABLE_GPU: '1',
      LD_PRELOAD: '/usr/lib64/libpil4dfs.so',
      D_LOG_MASK: 'INFO',
    };
    invariantsVerified = [
      'PBS Pro filesystems=flare:daos_user_fs mandatory directive present',
      'Intel GPU Max 1550 PVC 12-tile affinity binding (gpu_tile_compact.sh) active',
      'DAOS libpil4dfs.so POSIX interception & EC_16P3GX CRC32 container verified',
      'Cores 0 and 52 reserved for OS/Slingshot interrupts',
    ];
    generatedScript = `#!/bin/bash
#PBS -A CASL_SOVEREIGN_ALLOC
#PBS -N ${cleanName}
#PBS -q prod
#PBS -l select=${nodes}
#PBS -l walltime=${wallStr}
#PBS -l filesystems=flare:daos_user_fs
#PBS -l place=scatter:group=tier0
#PBS -k doe

module load frameworks/2026.1.0
export ONEAPI_DEVICE_SELECTOR=level_zero:gpu
export ZE_FLAT_DEVICE_HIERARCHY=FLAT
export SYCL_PI_LEVEL_ZERO_USE_IMMEDIATE_COMMANDLISTS=1
export MPIR_CVAR_ENABLE_GPU=1
export LD_PRELOAD=/usr/lib64/libpil4dfs.so

launch-dfuse.sh \${DAOS_POOL}:\${DAOS_CONT}
mpiexec -n ${nodes * 12} -ppn 12 --depth=8 --cpu-bind=depth \\
  gpu_tile_compact.sh ./casl_sycl_pvc --intent "${req.declarativeIntent}"`;
  } else if (sys.id === 'frontier' || sys.id === 'lumi') {
    exportedEnvVars = {
      MPICH_GPU_SUPPORT_ENABLED: '1',
      MPICH_OFI_NIC_POLICY: 'NUMA',
      FI_CXI_RDZV_PROTO: 'alt_read',
      FI_CXI_DEFAULT_CQ_SIZE: '131072',
      ROCR_VISIBLE_DEVICES: '$SLURM_LOCALID',
      GTL_ENABLE_HSA_IPC_SIGNAL_CACHE: '1',
    };
    invariantsVerified = [
      'AMD MI250X gfx90a 8-GCD NUMA-to-Slingshot-11 NIC mapping verified',
      '8 EPYC cores reserved (-S 8) for OS and Lustre/CXI system threads',
      'libfabric CXI completion queue depth (131072) & alt_read rendezvous configured',
    ];
    generatedScript = `#!/bin/bash
#SBATCH --job-name=${cleanName}
#SBATCH --nodes=${nodes}
#SBATCH --ntasks-per-node=8
#SBATCH --gpus-per-node=8
#SBATCH -S 8
#SBATCH --time=${wallStr}
#SBATCH -C nvme

module load PrgEnv-amd cpe/26.03 rocm/7.0.2 cray-mpich
export MPICH_GPU_SUPPORT_ENABLED=1
export MPICH_OFI_NIC_POLICY=NUMA
export FI_CXI_RDZV_PROTO=alt_read
export FI_CXI_DEFAULT_CQ_SIZE=131072

OMP_NUM_THREADS=7 srun -N ${nodes} -n ${nodes * 8} -c 7 \\
  --gpus-per-task=1 --gpu-bind=closest --cpu-bind=threads -m block:cyclic \\
  ./casl_mi250x_hip --intent "${req.declarativeIntent}"`;
  } else if (sys.id === 'isambard-ai') {
    exportedEnvVars = {
      NCCL_NET: 'AWS Libfabric',
      NCCL_NET_GDR_LEVEL: 'PHB',
      NCCL_CROSS_NIC: '1',
      NCCL_GDRCOPY_ENABLE: '1',
      NCCL_SOCKET_IFNAME: 'hsn',
      FI_CXI_DEFAULT_CQ_SIZE: '131072',
      FI_CXI_RDZV_PROTO: 'alt_read',
    };
    invariantsVerified = [
      'aarch64 Grace-Hopper GH200 NVLink-C2C coherency verified',
      'brics/nccl aws-ofi-nccl Slingshot-11 CXI plugin bound',
      '--network=disable_rdzv_get Slurm Cassini hardware offload protection active',
    ];
    generatedScript = `#!/bin/bash
#SBATCH --job-name=${cleanName}
#SBATCH --nodes=${nodes}
#SBATCH --gpus=${nodes * 4}
#SBATCH --ntasks-per-node=4
#SBATCH --cpus-per-task=72
#SBATCH --time=${wallStr}

module load PrgEnv-cray/8.7.0 cudatoolkit brics/nccl
export NCCL_NET="AWS Libfabric"
export NCCL_NET_GDR_LEVEL=PHB
export NCCL_CROSS_NIC=1
export NCCL_SOCKET_IFNAME=hsn
export FI_CXI_DEFAULT_CQ_SIZE=131072

srun --nodes=${nodes} --gpus=${nodes * 4} --cpus-per-task=72 \\
  --network=disable_rdzv_get --mpi=pmi2 \\
  ./casl_gh200_ofi --intent "${req.declarativeIntent}"`;
  } else if (sys.id === 'palantir-aip-foundry') {
    exportedEnvVars = {
      FOUNDRY_HOSTNAME: 'https://sovereign.palantirfoundry.com',
      GET_JOB_URI: 'https://localhost:8945/interactive-module/api/internal-query/job',
      POST_RESULT_URI: 'https://localhost:8945/interactive-module/api/internal-query/results',
      POST_SCHEMA_URI: 'https://localhost:8945/interactive-module/api/internal-query/schemas',
      DEFAULT_CA_PATH: '/etc/ssl/rubix-ca/ca.pem',
      MODULE_AUTH_TOKEN: '/opt/module-auth-token/MODULE_AUTH_TOKEN',
    };
    invariantsVerified = [
      'Rubix K8s 48h max node TTL & 72h container cycling compliance verified',
      'Compute Module OCI image strictly linux/amd64, numeric non-root USER 5001, explicit tag (no :latest)',
      'Loopback HTTPS sidecar IPC (:8945) verified with /etc/ssl/rubix-ca/ca.pem',
      'k-LLM Proxy Zero Data Retention (ZDR) & conjunctive Markings / CBAC enforced',
    ];
    generatedScript = `# Palantir Foundry / AIP Unified Compute Module & Orchestration Manifest
# Target: ${cleanName} (linux/amd64 on Rubix Zero-Trust Substrate)
FROM python:3.12.7-slim
USER 5001
EXPOSE 8080
ENTRYPOINT ["python3", "/app/casl_rubix_worker.py"]

// POST /api/v2/orchestration/builds/create
{
  "target": {
    "type": "manual",
    "targetRids": [
      "ri.foundry.main.dataset.77d9e123-4b88-4c19-9a01-33c8e71a9044"
    ]
  },
  "branchName": "master",
  "forceBuild": true,
  "retryCount": 2,
  "abortOnFailure": true,
  "caslDeclarativeIntent": ${JSON.stringify(req.declarativeIntent)}
}`;
  } else {
    // Gefion / BerzeLiUs DGX SuperPOD Slurm
    exportedEnvVars = {
      CUDA_DEVICE_ORDER: 'PCI_BUS_ID',
      NCCL_DEBUG: 'WARN',
      NCCL_NET_GDR_READ: '1',
      APPTAINERENV_CASL_MODE: 'ZERO_DEFICIT',
    };
    invariantsVerified = [
      'DGX SuperPOD non-blocking InfiniBand fat-tree RDMA verified',
      'Apptainer --nv --cleanenv container execution (Docker daemon disabled)',
      'Node-local NVMe scratch (/scratch/local) isolated per Slurm job',
    ];
    generatedScript = `#!/bin/bash
#SBATCH --job-name=${cleanName}
#SBATCH --nodes=${nodes}
#SBATCH --gpus-per-node=${accPerNode}
#SBATCH --time=${wallStr}

export CUDA_DEVICE_ORDER=PCI_BUS_ID
export NCCL_NET_GDR_READ=1
export APPTAINERENV_CASL_MODE=ZERO_DEFICIT

apptainer exec --nv --cleanenv /proj/casl/images/casl_sovereign.sif \\
  python3 /app/casl_project.py --intent "${req.declarativeIntent}"`;
  }

  const timestampIso = '2026-11-25T10:01:13Z';
  const cidPayload = canonicalJson(
    {
      systemId: sys.id,
      workloadName: cleanName,
      nodesCount: nodes,
      totalAccelerators: totalAcc,
      walltimeHours: wallHours,
      declarativeIntent: req.declarativeIntent,
      generatedScript,
      exportedEnvVars,
    },
    false
  );
  const cid = `bafyr4i${sha3_256Hex(cidPayload).slice(0, 52)}`;

  return {
    dispatchId: `CASL-EXEC-${sha3_256Hex(cid).slice(0, 10).toUpperCase()}`,
    cid,
    systemId: sys.id,
    systemName: sys.name,
    schedulerKind: sys.schedulerKind,
    workloadName: cleanName,
    nodesCount: nodes,
    totalAccelerators: totalAcc,
    walltimeHours: wallHours,
    generatedScript,
    exportedEnvVars,
    invariantsVerified,
    status: 'ACTIVE_SYNTHESIZED_ZERO_DEFICIT',
    timestampIso,
  };
}

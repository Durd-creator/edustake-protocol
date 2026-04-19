import fs from "fs";
import { ethers } from "ethers";

async function main() {
    console.log("==========================================");
    console.log("🚀 Iniciando Protocolo EduStake (Via RPC Local)...");

    // 1. Conectando diretamente no seu terminal que está rodando o servidor
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    
    const owner = await provider.getSigner(0);
    const user1 = await provider.getSigner(1);

    // 2. Lendo os arquivos compilados do seu HD
    function getContractData(name) {
        const path = `./artifacts/contracts/${name}.sol/${name}.json`;
        return JSON.parse(fs.readFileSync(path, "utf8"));
    }

    const tokenData = getContractData("EduToken");
    const badgeData = getContractData("EduBadge");
    const stakingData = getContractData("EduStaking");
    const daoData = getContractData("EduDAO");

    // 3. Fazendo o Deploy Manual
    const tokenFactory = new ethers.ContractFactory(tokenData.abi, tokenData.bytecode, owner);
    const token = await tokenFactory.deploy();
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();

    const badgeFactory = new ethers.ContractFactory(badgeData.abi, badgeData.bytecode, owner);
    const badge = await badgeFactory.deploy();
    await badge.waitForDeployment();
    const badgeAddress = await badge.getAddress();

    const stakingFactory = new ethers.ContractFactory(stakingData.abi, stakingData.bytecode, owner);
    const staking = await stakingFactory.deploy(tokenAddress, badgeAddress, ethers.ZeroAddress);
    await staking.waitForDeployment();
    const stakingAddress = await staking.getAddress();

    const daoFactory = new ethers.ContractFactory(daoData.abi, daoData.bytecode, owner);
    const dao = await daoFactory.deploy(badgeAddress);
    await dao.waitForDeployment();
    const daoAddress = await dao.getAddress();

    // 4. Executando as lógicas
    const badgeOwner = new ethers.Contract(badgeAddress, badgeData.abi, owner);
    await badgeOwner.transferOwnership(stakingAddress);

    const tokenOwner = new ethers.Contract(tokenAddress, tokenData.abi, owner);
    const amountToStake = ethers.parseUnits("100", 18);
    await tokenOwner.mint(user1.address, amountToStake);

    console.log("✅ Contratos implantados com sucesso!\n");
    console.log("==========================================");
    console.log("🎬 DEMONSTRAÇÃO WEB3 (ETAPA 5)");
    console.log("==========================================\n");

    // ==========================================
    // AÇÃO 1: STAKE DE TOKENS E MINT DE NFT
    // ==========================================
    console.log("👨‍🎓 Usuário aprova o gasto de seus 100 Tokens EDU...");
    const tokenUser = new ethers.Contract(tokenAddress, tokenData.abi, user1);
    await tokenUser.approve(stakingAddress, amountToStake);

    console.log("🔒 Usuário faz o Stake dos tokens...");
    const stakingUser = new ethers.Contract(stakingAddress, stakingData.abi, user1);
    await stakingUser.stake(amountToStake);

    const nftBalance = await badgeOwner.balanceOf(user1.address);
    console.log(`✨ SUCESSO! Saldo de NFT (EduBadge) do usuário: ${nftBalance.toString()} (Mint realizado!)\n`);

    // ==========================================
    // AÇÃO 2: VOTAÇÃO NA DAO
    // ==========================================
    console.log("📜 Usuário cria uma proposta na DAO (Apenas membros com NFT podem)...");
    const daoUser = new ethers.Contract(daoAddress, daoData.abi, user1);
    await daoUser.createProposal("Lancar curso de Web3 Avancado");

    console.log("🗳️ Usuário vota a favor da proposta recém-criada...");
    await daoUser.vote(0, true);

    const proposal = await daoUser.proposals(0);
    console.log(`✨ SUCESSO! Voto registrado na DAO. Votos a favor: ${proposal[3].toString()} \n`); // Índice 3 é o votesFor
    
    console.log("==========================================");
    console.log("🎉 Demonstração concluída!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
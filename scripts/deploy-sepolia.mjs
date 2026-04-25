import fs from "fs";
import { ethers } from "ethers";

// Conexão com a rede pública da Sepolia
const ALCHEMY_URL = "https://ethereum-sepolia-rpc.publicnode.com";

// A sua Chave Privada (com o '0x' na frente para o Ethers.js aceitar)
const PRIVATE_KEY = "CHAVE_OCULTA_POR_SEGURANCA";

async function main() {
    console.log("==========================================");
    console.log("🌐 Conectando à rede mundial SEPOLIA...");

    const provider = new ethers.JsonRpcProvider(ALCHEMY_URL);
    const owner = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log(`Conectado com a carteira: ${owner.address}`);
    
    // O código vai olhar na blockchain e provar que o seu dinheiro do Faucet está lá!
    const balance = await provider.getBalance(owner.address);
    console.log(`💰 Seu Saldo na Sepolia: ${ethers.formatEther(balance)} ETH\n`);

    if (balance === 0n) {
        console.log("❌ Erro: A carteira está sem saldo. Verifique o Faucet.");
        return;
    }

    function getContractData(name) {
        const path = `./artifacts/contracts/${name}.sol/${name}.json`;
        return JSON.parse(fs.readFileSync(path, "utf8"));
    }

    console.log("⏳ Iniciando o Deploy dos Contratos (Isso pode levar alguns segundos na rede real)...");

    const tokenData = getContractData("EduToken");
    const tokenFactory = new ethers.ContractFactory(tokenData.abi, tokenData.bytecode, owner);
    const token = await tokenFactory.deploy();
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log(`✅ EduToken publicado em: ${tokenAddress}`);

    const badgeData = getContractData("EduBadge");
    const badgeFactory = new ethers.ContractFactory(badgeData.abi, badgeData.bytecode, owner);
    const badge = await badgeFactory.deploy();
    await badge.waitForDeployment();
    const badgeAddress = await badge.getAddress();
    console.log(`✅ EduBadge publicado em: ${badgeAddress}`);

    const stakingData = getContractData("EduStaking");
    const stakingFactory = new ethers.ContractFactory(stakingData.abi, stakingData.bytecode, owner);
    const staking = await stakingFactory.deploy(tokenAddress, badgeAddress, ethers.ZeroAddress);
    await staking.waitForDeployment();
    const stakingAddress = await staking.getAddress();
    console.log(`✅ EduStaking publicado em: ${stakingAddress}`);

    console.log("\n==========================================");
    console.log("🎉 DEPLOY CONCLUÍDO COM SUCESSO!");
    console.log(`Link do Explorer: https://sepolia.etherscan.io/address/${stakingAddress}`);
    console.log("==========================================");
}

main().catch(console.error);
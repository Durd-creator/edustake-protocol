// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Importação da trava de segurança contra ataques de reentrância
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// Importação do Oráculo da Chainlink
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// Interfaces para conectarmos com os contratos que você já criou
interface IEduBadge {
    function safeMint(address to) external;
}

interface IEduToken {
    function mint(address to, uint256 amount) external;
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract EduStaking is ReentrancyGuard {
    IEduToken public stakingToken;
    IEduBadge public badgeNFT;
    AggregatorV3Interface public priceFeed;

    mapping(address => uint256) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => uint256) public lastStakeTime;

    // O construtor recebe os endereços dos contratos e do oráculo quando fizermos o deploy
    constructor(address _stakingToken, address _badgeNFT, address _priceFeed) {
        stakingToken = IEduToken(_stakingToken);
        badgeNFT = IEduBadge(_badgeNFT);
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    // Função de depósito (Stake) com modificador de segurança nonReentrant
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "O valor deve ser maior que 0");

        // Regra de negócio: Emite o NFT VIP no primeiro depósito do usuário
        if (!hasStaked[msg.sender]) {
            badgeNFT.safeMint(msg.sender);
            hasStaked[msg.sender] = true;
        }

        // Transfere os tokens do usuário para este contrato
        stakingToken.transferFrom(msg.sender, address(this), amount);
        
        stakingBalance[msg.sender] += amount;
        lastStakeTime[msg.sender] = block.timestamp;
    }

    // Função para ler o preço atual do Ethereum/USD usando o Oráculo da Chainlink
    function getLatestEthPrice() public view returns (int) {
        (
            /* uint80 roundID */,
            int price,
            /* uint startedAt */,
            /* uint timeStamp */,
            /* uint80 answeredInRound */
        ) = priceFeed.latestRoundData();
        return price;
    }

    // Função que calcula a recompensa usando o dado externo do oráculo
    function calculateReward(address user) public view returns (uint256) {
        uint256 stakedAmount = stakingBalance[user];
        if (stakedAmount == 0) return 0;

        uint256 timeStaked = block.timestamp - lastStakeTime[user];
        int ethPrice = getLatestEthPrice();

        // Lógica do Oráculo: se o ETH estiver abaixo de $3000 (3000 * 10^8), a taxa de recompensa é o dobro (20) para incentivar o usuário.
        // Se estiver acima, a taxa é normal (10).
        uint256 rewardRate = (ethPrice < 3000 * 10**8) ? 20 : 10; 

        // Cálculo base simulado
        return (stakedAmount * rewardRate * timeStaked) / 100000;
    }

    // Função para o usuário resgatar as recompensas geradas
    function claimReward() external nonReentrant {
        uint256 reward = calculateReward(msg.sender);
        require(reward > 0, "Nenhuma recompensa disponivel");

        lastStakeTime[msg.sender] = block.timestamp; // Reseta o tempo
        stakingToken.mint(msg.sender, reward); // Minta novos tokens de recompensa para o usuário
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Interface para verificar se o usuário possui o NFT
interface IEduBadge {
    function balanceOf(address owner) external view returns (uint256);
}

contract EduDAO {
    IEduBadge public badgeNFT;

    // Estrutura de uma proposta de votação
    struct Proposal {
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        bool executed;
        // Mapping interno para registrar quem já votou nesta proposta específica
        mapping(address => bool) hasVoted;
    }

    uint256 public nextProposalId;
    mapping(uint256 => Proposal) public proposals;

    constructor(address _badgeNFT) {
        badgeNFT = IEduBadge(_badgeNFT);
    }

    // Modificador de segurança: exige que o usuário tenha pelo menos 1 NFT
    modifier onlyMember() {
        require(badgeNFT.balanceOf(msg.sender) > 0, "Apenas membros com EduBadge podem participar");
        _;
    }

    // Função para criar uma nova proposta (ex: "Lançar curso de Solidity Avançado")
    function createProposal(string memory _description) external onlyMember {
        Proposal storage newProposal = proposals[nextProposalId];
        newProposal.description = _description;
        newProposal.executed = false;
        
        nextProposalId++;
    }

    // Função para votar na proposta (true = a favor, false = contra)
    function vote(uint256 _proposalId, bool _support) external onlyMember {
        Proposal storage proposal = proposals[_proposalId];
        
        require(!proposal.hasVoted[msg.sender], "Voce ja votou nesta proposta");
        require(!proposal.executed, "A proposta ja foi encerrada/executada");

        proposal.hasVoted[msg.sender] = true;

        if (_support) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }
    }
}
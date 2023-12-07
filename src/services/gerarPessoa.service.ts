export function gerarUsuarioAleatorio() {
    const nomes = ["Alice", "Miguel", "Sophia", "Arthur", "Helena", "Lorran", "Bernardo", "Luffy", "Naruto", "Valentina", "Heitor", "Laura", "Davi", "Isabella", "Pamela", "Renato", "Alec", "Nathaniel", "Natali", "Margot", "Renan", "André", "Jonathas", "Lorenzo", "Manuela", "Théo", "Júlia"];
    const sobrenomes = ["Suzuki", "Kurt", "Nakao", "Siqueira", "Yamamoto", "Bueno", "Golden", "Monkey", "Uzumaki", "Trajano", "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes"];
  
    const nome = `${nomes[Math.floor(Math.random() * nomes.length)]} ${sobrenomes[Math.floor(Math.random() * sobrenomes.length)]}`;
    const idade = Math.floor(Math.random() * 100) + 1; // Idade entre 1 e 100
  
    return { nome, idade };
  }
  
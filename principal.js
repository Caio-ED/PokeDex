
var axios = require('axios')
var rs = require('readline-sync')
var fs = require('fs')

    // End Points da PokeApi
const endPoint_Pokemon = "https://pokeapi.co/api/v2/pokemon/"
const endPoint_Tipo = 'https://pokeapi.co/api/v2/type/'
const endPoint_Habilidade = 'https://pokeapi.co/api/v2/ability/'

class Pokemon {
    constructor(nome, tipo, habilidade){
        this.nome = nome;
        this.tipo = tipo;
        this.habilidade = habilidade;
    }
}

function PerguntaSeQuerSalvar(nome, tipo, habilidade){
    // poderia ter usado o rs.keyInYN mas optei por deixar em portugues
    do{ 
        var desejaSalvar = rs.question("Deseja salvar este Pokemon na Pokedex? (s/n)").toLocaleLowerCase()
        if (desejaSalvar == 's'){
            return SalvaNaPokedex(nome,tipo,habilidade)
        } else if (desejaSalvar == 'n'){
            return
        }
        console.log("Desculpe não entendi...");
        } while (true)
}

function SalvaNaPokedex (nome,tipo ,habilidade){
    let Pokedex = fs.readFileSync('.Pokedex.json');
        Pokedex = JSON.parse(Pokedex);

    var Poke = new Pokemon(nome,tipo, habilidade);
        Pokedex.push(Poke)
        Pokedex_Serializada = JSON.stringify(Pokedex);
    fs.writeFileSync('.Pokedex.json',Pokedex_Serializada)
    console.log('Pokemon Salvo na PokeDex c sucesso !')
}

var pokemonRequerido = rs.question("Digite o nome de um Pokemon,ou seu id: ").toLocaleLowerCase();
axios.get(endPoint_Pokemon + pokemonRequerido)
    .then((resposta) => {

        var Pokemon = resposta.data

        var lista_habilidades = []
        Pokemon.abilities.forEach((habilidade) => {
        lista_habilidades.push(habilidade.ability.name)           
        });

        var Tipo_Pokemon = []
        Pokemon.types.forEach((tipo) => {
            Tipo_Pokemon.push(tipo.type.name)
        })

        console.log(`   Pokemon \n===============\nNome: ${Pokemon.name}\nTipo: ${Tipo_Pokemon}\nHabilidades: ${lista_habilidades}`)
        PerguntaSeQuerSalvar(Pokemon.name,Tipo_Pokemon,lista_habilidades);
    })

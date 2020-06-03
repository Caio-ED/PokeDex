
var axios = require('axios')
var rs = require('readline-sync')
var fs = require('fs')

    // End Points da PokeApi
const endPoint_Pokemon = "https://pokeapi.co/api/v2/pokemon/"
const endPoint_Tipo = 'https://pokeapi.co/api/v2/type/'
const endPoint_Habilidade = 'https://pokeapi.co/api/v2/ability/'

var Pokedex = fs.readFileSync('.Pokedex.json');
    Pokedex = JSON.parse(Pokedex);

class Pokemon {
    constructor(nome, tipo, habilidade){
        this.nome = nome;
        this.tipo = tipo;
        this.habilidade = habilidade;
    }
}
function VerificaPokemonNaPokeDex(Pokedex, nomePokemon){
    
    for(const poke of Pokedex){
        if(poke.nome == nomePokemon){
            return true
        } else {
            return false
        }
    }
    
}

function RetornaRelacaodeDanoentreTiposdePokemons(url_Tipos){

}

function RetornaDescriçãodasHabilidades(urls){

    //Para cada URL. de cada Habilidade
    urls.forEach((url) => {
        axios.get(url)
            .then((respostaURL) => {
                var habilidade = respostaURL.data
                
                
                console.log(`======= Descrição ${habilidade.name} ============`)
                //Para cada Efeito da Habilidade
                var descricao = ''
                habilidade.effect_entries.forEach(efeito => {
                    descricao += efeito.effect + ''
                    console.log(descricao)
                })
                
            })
    })
    
}

function PerguntaSeQuerSalvar(pokedex, nome, tipo, habilidade){
    // poderia ter usado o rs.keyInYN mas optei por deixar em portugues
    do{ 
        var desejaSalvar = rs.question("Deseja salvar este Pokemon na Pokedex? (s/n)").toLocaleLowerCase()
        if (desejaSalvar == 's'){
            return SalvaNaPokedex(pokedex,nome,tipo,habilidade)
        } else if (desejaSalvar == 'n'){
            return
        }
        console.log("Desculpe não entendi...");
        } while (true)
}

function SalvaNaPokedex (pokedex, nome, tipo, habilidade){
    

    var Poke = new Pokemon(nome,tipo, habilidade);
        pokedex.push(Poke)
        Pokedex_Serializada = JSON.stringify(Pokedex);
    fs.writeFileSync('.Pokedex.json',Pokedex_Serializada)
    console.log('Pokemon Salvo na PokeDex c sucesso !')
}

var pokemonRequerido = rs.question("Digite o nome de um Pokemon,ou seu id: ").toLocaleLowerCase();
axios.get(endPoint_Pokemon + pokemonRequerido)
    .then((resposta) => {

        var Pokemon = resposta.data

        var lista_habilidades = []
        var url_habilidades = []
        Pokemon.abilities.forEach((habilidade) => {
        lista_habilidades.push(habilidade.ability.name)
        url_habilidades.push(habilidade.ability.url)           
        });
        // RetornaDescriçãodasHabilidades(url_habilidades)

        var Tipo_Pokemon = []
        var url_Tipos = []
        Pokemon.types.forEach((tipos) => {
            Tipo_Pokemon.push(tipos.type.name)
            url_Tipos.push(tipos.type.name)
        })
        // RetornaRelacaodeDanoentreTiposdePokemons(url_Tipos)

        

        console.log(`\
        \n======= Pokemon ===================\
        \nNome: ${Pokemon.name}\
        \nTipo: ${Tipo_Pokemon}\
        \nHabilidades: ${lista_habilidades}\
        \n===================================`)

        
        if(!VerificaPokemonNaPokeDex(Pokedex, Pokemon.name)){
            PerguntaSeQuerSalvar(Pokedex, Pokemon.name,Tipo_Pokemon,lista_habilidades);
        } else {
            console.log("Voce ja Possui este poke em sua PokeDex")
        }

    })

var axios = require('axios')
var rs = require('readline-sync')
var fs = require('fs')

// End Points da PokeApi
const endPoint_Pokemon = "https://pokeapi.co/api/v2/pokemon/"

// não foram necessarios ainda a url estava contida no Poke
const endPoint_Tipo = 'https://pokeapi.co/api/v2/type/'
const endPoint_Habilidade = 'https://pokeapi.co/api/v2/ability/'

var Pokedex = fs.readFileSync('.Pokedex.json');
    Pokedex = JSON.parse(Pokedex);

var nome_ou_id = rs.question("Digite o nome de um Pokemon,ou seu id: ").toLocaleLowerCase();
PegaPokemon(nome_ou_id, Pokedex)


function PegaPokemon(nome_ou_id,Pokedex) {
    axios.get(endPoint_Pokemon + nome_ou_id)
        .then((resposta) => {

            var Pokemon = resposta.data //objeto do Pokemon

            var habilidades = []
            var url_habilidades = []

            var tipo_Pokemon = []
            var url_Tipos = []

                                        // Logica para extrair nome e url das habilidades
            Pokemon.abilities.forEach((habilidade) => {
                habilidades.push(habilidade.ability.name)
                url_habilidades.push(habilidade.ability.url)
            });
            
                                        // Logica para extrair nome e url dos tipos
            Pokemon.types.forEach((tipos) => {
                tipo_Pokemon.push(tipos.type.name)
                url_Tipos.push(tipos.type.url)
            })

            infoPokemons = {
                id: Pokemon.id,
                nome: Pokemon.name,
                tipo: tipo_Pokemon,
                habilidade: habilidades,
                descricoes: [],
                dobro_dano: [],
                metade_dano: [],
                naocausa_dano: []
            }

            PegaDescriçãoHabilidades(url_habilidades,url_Tipos ,infoPokemons,Pokedex)
        })
}

function PegaDescriçãoHabilidades(url_habilidades ,url_Tipos ,infoPokemons, Pokedex) {

    //Para cada URL. de cada Habilidade
    url_habilidades.forEach((url, index) => {
        axios.get(url)
            .then((respostaURL) => {
                let habilidade = respostaURL.data
                let nome, descricao = ''

                descricao = habilidade.effect_entries.map(valor => {
                    if(valor.language.name == 'en'){
                        return valor.short_effect
                    }
                })
                // descricao = habilidade.effect_entries[0].short_effect
                nome = habilidade.name
                descrições = `${nome}: ${descricao}\n`
                infoPokemons.descricoes.push(descrições);
                if(index == (url_habilidades.length - 1)) {
                    PegaRelacaodeDanosEntreTipos(url_Tipos,infoPokemons,Pokedex)
                }
            })
    })
}

function PegaRelacaodeDanosEntreTipos(url_Tipos, infoPokemons,Pokedex) {
    

    url_Tipos.forEach((url, index) => {

        axios.get(url)
        .then(response => {

            Relacoes_Tipo = response.data.damage_relations;
            var dobro_dano = Relacoes_Tipo.double_damage_to.map( value => {
                return value.name
            })

            var metade_dano = Relacoes_Tipo.half_damage_to.map( value => {
                return value.name
            })

            var naocausa_dano = Relacoes_Tipo.no_damage_to.map( value => {
                return value.name
            })

            infoPokemons.dobro_dano.push(dobro_dano);
            infoPokemons.metade_dano.push(metade_dano);
            infoPokemons.naocausa_dano.push(naocausa_dano);
            if(index == (url_Tipos.length - 1)) {
                ExibePokemon(infoPokemons,Pokedex);
            }
        })

    })
}

function ExibePokemon(infoPokemons,Pokedex){
    const {
    id,
    nome,
    tipo,
    habilidade,
    descricoes,
    dobro_dano,
    metade_dano,
    naocausa_dano } = infoPokemons

    console.log(`\
            \n======= Pokemon ===================\
            \nNome: ${nome} id: ${id}\
            \nTipo: ${tipo}\
            \nHabilidades: ${habilidade}\
            \n------- Detalhes ------------------\
            \nDescriçao Habilidades:\n ${String(descricoes).replace(',',' ')}\
            \n------- Relações de Dano ----------\
            \nDobro de Dano: ${dobro_dano}\
            \nMetade de Dano: ${metade_dano}\
            \nNão Causa Dano: ${naocausa_dano}`)

        VerificaPokemonNaPokeDex(id, infoPokemons,Pokedex)
}

function VerificaPokemonNaPokeDex(id, infoPokemons,Pokedex) {

    for (const poke of Pokedex) {
        if (poke.id == id) {
            console.log("\nVocê ja possui este pokemon")
        } else {
            // poderia ter usado o rs.keyInYN mas optei por deixar em portugues
            do {
                var desejaSalvar = rs.question("Deseja salvar este Pokemon na Pokedex? (s/n)").toLocaleLowerCase()
                if (desejaSalvar == 's') {

                    Pokedex.push(infoPokemons)
                    Pokedex_Serializada = JSON.stringify(Pokedex);
                    fs.writeFileSync('.Pokedex.json', Pokedex_Serializada)
                    console.log('Pokemon Salvo na PokeDex c sucesso !')
                    return
                } else if (desejaSalvar == 'n') {
                    return
                }
                console.log("Desculpe não entendi...");
            } while (true)
        }
    }
}





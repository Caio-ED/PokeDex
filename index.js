// End Points da PokeApi
const endPoint_Pokemon = "https://pokeapi.co/api/v2/pokemon/"

// não foram necessarios ainda a url estava contida no Poke
const endPoint_Tipo = 'https://pokeapi.co/api/v2/type/'
const endPoint_Habilidade = 'https://pokeapi.co/api/v2/ability/'

const linkimagens= 'http://assets.pokemon.com/assets/cms2/img/pokedex/full/001.png'
const linkimagensAlt = 'https://pokeres.bastionbot.org/images/pokemon/1.png'

// var Pokedex = fs.readFileSync('.Pokedex.json');
//     Pokedex = JSON.parse(Pokedex);

window.onload = PegaPokemon()
function PegaPokemon() {
   var nome_ou_id = document.querySelector('#nomeid').value

   if (nome_ou_id == false) { 
       nome_ou_id = (Math.random() * 10 + 1).toFixed()
   }

    axios.get(endPoint_Pokemon + nome_ou_id)
        .then((resposta) => {

            var Pokemon = resposta.data //objeto do Pokemon
            document.getElementById('foto').src = 'https://pokeres.bastionbot.org/images/pokemon/'+ Pokemon.id +'.png'
            var habilidades = []
            var url_habilidades = []

            var tipos_Pokemon = []
            var url_Tipos = []

                                        // Logica para extrair nome e url das habilidades
            Pokemon.abilities.forEach((habilidade) => {
                habilidades.push(habilidade.ability.name)
                url_habilidades.push(habilidade.ability.url)
            }); 
            
                                        // Logica para extrair nome e url dos tipos
            Pokemon.types.forEach((tipos) => {
                tipos_Pokemon.push(tipos.type.name)
                url_Tipos.push(tipos.type.url)
            })

            infoPokemons = {
                id: Pokemon.id,
                nome: Pokemon.name,
                tipo: tipos_Pokemon,
                habilidade: habilidades,
                descricoes: [],
                dobro_dano: [],
                metade_dano: [],
                naocausa_dano: []
            }

            PegaDescriçãoHabilidades(url_habilidades,url_Tipos ,infoPokemons)
            PegaPokemonsdoMesmoTipo(tipos_Pokemon)
        })
}

async function PegaDescriçãoHabilidades(url_habilidades ,url_Tipos ,infoPokemons) {

    //Para cada URL. de cada Habilidade
     await url_habilidades.forEach((url, index) => {
        axios.get(url)
            .then((respostaURL) => {
                let habilidade = respostaURL.data
                let nome, descricao 

                var entrie = habilidade.effect_entries.find( (valor) => valor.language.name == 'en')
                descricao = entrie.short_effect

                nome = habilidade.name
                descrições = `${nome}: ${descricao}`
                infoPokemons.descricoes.push(descrições);
                if(index == (url_habilidades.length - 1)) {
                    PegaRelacaodeDanosEntreTipos(url_Tipos,infoPokemons)
                }

            })
    })
}

async function PegaRelacaodeDanosEntreTipos(url_Tipos, infoPokemons) {
    

   await url_Tipos.forEach((url, index) => {

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
                ExibePokemon(infoPokemons);
            }
        })

    })
}

function ExibePokemon(infoPokemons,Pokedex){
    LimpaHabilidades()
    const {
    id,
    nome,
    tipo,
    habilidade,
    descricoes,
    dobro_dano,
    metade_dano,
    naocausa_dano } = infoPokemons
    
    document.getElementById('nome').innerText = `Nome: ${nome}`
    document.getElementById('tipo').innerText = `Tipo: ${tipo}`
    document.getElementById('habilidades').innerText = `Habilidades: ${habilidade}`
    
    descricoes.forEach((desc => {
        var infoPoke = document.getElementById('infoPoke')
        var pdescricao = document.createElement('p')
        pdescricao.setAttribute('class', 'descricao')
         pdescricao.innerHTML = desc
        infoPoke.append(pdescricao)
    }))
    



        
    console.log(`\
            \n======= Pokemon ===================\
            \nNome: ${nome} id: ${id}\
            \nTipo: ${tipo}\
            \nHabilidades: ${habilidade}\
            \n------- Detalhes ------------------\
            \nDescriçao Habilidades:\n`)
    descricoes.forEach(des => console.log(des))
    console.log(`\n------- Relações de Dano ----------\
            \nDobro de Dano: ${dobro_dano}\
            \nMetade de Dano: ${metade_dano}\
            \nNão Causa Dano: ${naocausa_dano}`)

        // VerificaPokemonNaPokeDex(id, infoPokemons,Pokedex)
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

function PegaPokemonsdoMesmoTipo(tipos){
    tipos.forEach((tipo) => {
        axios.get('https://pokeapi.co/api/v2/type/'+ tipo)
            .then((resposta) => {
                pokemons_do_mesmo_tipo = resposta.data.pokemon;
                // console.log(pokemons_do_mesmo_tipo)

            })
            .catch((erro) => {
                console.log(erro);
            });
    })
}

function LimpaHabilidades(){
    var sujeira = document.querySelectorAll('.descricao')
        sujeira.forEach(p => {
            p.remove()
        })
}


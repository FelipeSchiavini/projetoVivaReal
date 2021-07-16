const houseInfoContainer = document.querySelector('.houseInfoContainer')
const houseHeader = document.querySelector('.houseHeader')
const citySelected = document.querySelector('.citySelected')
const inputSearch = document.querySelector('.inputSearch')

const citys =[{
    'são paulo': 'sp',
    'rio de janeiro' : 'rj'
}]

const amenitiesTranslate  = {
    'AIR_CONDITIONING':'Ar Condicionado',
    'AMERICAN_KITCHEN':'Cozinha Americana',
    'BARBECUE_GRILL':'Churrasqueira',
    'BICYCLES_PLACE':'Bicicletário',
    'CINEMA':'Cinema',
    'ELECTRONIC_GATE':'Portaria Eletrônica',
    'ELEVATOR':'Elevador',
    'FIREPLACE':'Lareira',
    'FURNISHED':'Mobiliado',
    'GARDEN':'Jardim',
    'GATED_COMMUNITY':'Condomínio Fechado',
    'GYM':'Academia',
    'LAUNDRY':'Lavanderia',
    'PARTY_HALL':'Salão de Festas',
    'PETS_ALLOWED':'Aceita PETS',
    'PLAYGROUND':'Playground',
    'POOL':'Piscina',
    'SAUNA':'Sauna',
    'SPORTS_COURT':'Quadra de Esportes',
    'TENNIS_COURT':'Quadra de Tênis'
  }

  //API IBGE TO RETURN ESTADO AND UF
  async function getIBGEAPI(uf) {
    const endpoint = "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
    const response =  await fetch(endpoint)
    const userData = await response.json();
    console.log(response.status)
    if(response.status == 200){
        let estado = userData.filter((cidade) => cidade.nome.toLowerCase() == uf.toLowerCase())
        return {
            nome: estado[0].nome.toLowerCase().replaceAll(" ", "-").replaceAll("ã","a"),
            uf: estado[0].sigla.toLowerCase()
        }
    }
    
} 

async function getAPI(estado) {
    try {
        let {nome, uf} = await getIBGEAPI(estado)
        const endpoint = `https://private-9e061d-piweb.apiary-mock.com/venda?state=${uf}&city=${nome}`
        const response =  await fetch(endpoint);
        if (response.status == 200){
            const userData = await response.json();
            const housesInfo = getHousesInfo(userData);
            const totalCount = getTotalCount(userData);
            printHouseCards(housesInfo);
            printHeaderHouses(housesInfo[0].city, totalCount);
        } else if (response.status == 500) {
            printError(response.status)
        }
    } catch {
            printError(404)
    }
    
}

inputSearch.addEventListener('keypress', (event) => {
    if (event.key === 'Enter'){
    let estado = event.target.value
    getAPI(estado)
    }
})

// GETTERS
function getTotalCount (apiDict){
    return apiDict.search.totalCount
}

function getHousesInfo (apiDict){
    return apiDict.search.result.listings.map((i) => {
        return {
            address : `${i.listing.address.street}, ${i.listing.address.streetNumber} - ${i.listing.address.neighborhood}, ${i.listing.address.state} - ${i.listing.address.stateAcronym}`,
            city: `${i.listing.address.state} - ${i.listing.address.stateAcronym}`,
            description : `${i.link.name}`,
            area : parseInt(i.listing.usableAreas[0]),
            bedrooms: parseInt(i.listing.bedrooms),
            bathrooms: parseInt(i.listing.bathrooms),
            parkingSpaces : parseInt(i.listing.parkingSpaces),
            amenities: i.listing.amenities,
            pricingInfos: i.listing.pricingInfos[0],
            housePicture: i.medias[0].url
        }
    })
}

function printHouseCards (houseInfo){
    let cards =""
    
    houseInfo.forEach(house => {
        cards += `
        <section class="house-card">
        <img
          src="${house.housePicture}"
          alt="house-pictures"
            class="housePictures"
        />
        <article class="house-itens">
          <span class="house-address">${house.address}</span>
          <div>
            <span class="house-description-value">${house.area}</span
            ><span class="house-description-text"> m² </span
            ><span class="house-description-value">${house.bedrooms}</span
            ><span class="house-description-text"> Quartos </span
            ><span class="house-description-value">${house.bathrooms}</span
            ><span class="house-description-text"> Banheiros </span
            ><span class="house-description-value">${house.parkingSpaces}</span
            ><span class="house-description-text"> Vaga</span>
          </div>
          <ul class="house-tags">
            ${getAmenities(house.amenities)}
          </ul>
          <span class="prince-house">R$ ${house.pricingInfos.price.split(/(?=(?:...)*$)/).join('.')}</span>
          <span class="price-condo"> ${house.pricingInfos.monthlyCondoFee ? `Condominio: R$ ${house.pricingInfos.monthlyCondoFee.split(/(?=(?:...)*$)/).join('.')}` : ""}</span>
        </article>
      </section>
      `
    });
    houseInfoContainer.innerHTML = cards
}

function printError (erro){
    console.log('entrou')
    houseInfoContainer.innerHTML = `
    <div class ="divError">
        <p class = "error">OPS!!!!</p>
        <p class = "error">
        ALGO DEU ERRADO NA SUA BUSCA.</p>
        <p class = "errorRed"> STATUS ${erro}</p>
        <p class = "error">POR FAVOR! TENTE NOVAMENTE</p>
    </div>`
    houseHeader.innerHTML = ``
    citySelected.innerHTML = ``
}

function printHeaderHouses (city, totalCount){
    houseHeader.innerHTML = `<div><strong> ${totalCount} </strong>Imóveis à venda em ${city}</div>`
    citySelected.innerHTML = `<div class="citySelect">${city}<div>`
}

function getAmenities (amenities) {
    let amenitiesHtml =""
    if (amenities) {
        amenities.forEach(element => {
            amenitiesHtml +=`<li class="house-tags-item">${amenitiesTranslate[element]}</li>`
        });
    }
    return amenitiesHtml
}

getAPI('São Paulo')

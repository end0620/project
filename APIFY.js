function pageFunction(context) {
    var caracteristicsLables = ['Superfície habitável', 'Terreno', 'Divisões'];
    var caracteristicsKeyNames = ['living_area', 'land_area', 'rooms'];

    function normaliceNumber(stringWithNumber){
        var number = stringWithNumber.match(/[0-9]*/gm);
        var fixedNumber = parseInt(number.join(''));
        return fixedNumber;
    }
    
    function NormaliceHouseInfo(houseInfo, price){
        var houseDetails = {
            address: null,
            price: null,
            living_area: null,
            land_area: null,
            rooms: null
        };
        var houseInfoFinal ={
          link: context.request.url,
          location: {
            country: "Portugal",
            city: "Lisbon",
            address: "",
            coordinates: {
              lat: "",
              lng: ""
            }
          },
          size: {
            parcel_m2: "",
            gross_m2: "",
            net_m2: "",
            rooms: ""
          },
          price: {
            value: "",
            currency: "EUR"
          },
          description: $('p', '#DescriptionDiv').text().trim(),
          title: $('#mainInfoAdvertPage .item-title').text().trim(),
          images: [""]
        };
        
        
    
        houseDetails.price = parseInt(normaliceNumber(price.text()));
        houseDetails.address = houseInfo.find('.item-location p').text();
    
        var sz = houseInfo.length;
        for(var i = 0; i < sz; ++i){
            var elm = houseInfo.eq(i).text();
            caracteristicsLables.forEach(function(label, index){
                if(elm.match(label)){
                    var number = normaliceNumber(elm);
                    houseDetails[caracteristicsKeyNames[index]] = number;    
                }
            });
        }
        
        houseInfoFinal.price.value = houseDetails.price;
        houseInfoFinal.location.address = houseDetails.address;
        houseInfoFinal.size.parcel_m2 = houseDetails.land_area;
        houseInfoFinal.size.gross_m2 = houseDetails.living_area;
        houseInfoFinal.size.rooms = houseDetails.rooms;
           
    
        return houseInfoFinal;
    }
    // called on every page the crawler visits, use it to extract data from it
    var $ = context.jQuery;
    
    if(context.request.label === "houseDetails"){
        context.skipLinks()
        
        var price = $('.title-standard span.price');
        var houseInfo = $('#mainInfoAdvertPage li');
    
        var HouseInfoNormaliced = NormaliceHouseInfo(houseInfo, price);
        var result = {
            title: $('#mainInfoAdvertPage .item-title').text(),
            price: $('.title-standard span.price').text(), 
            currency: 'EUR'
        };
        result.price = HouseInfoNormaliced.price;
        return HouseInfoNormaliced;
    }else{
        context.skipOutput();
    }
}
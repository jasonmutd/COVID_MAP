
export const MapUtils = {
    //zoom level
    // county
    // state
    // stats
    // coordinates
    getUSCovidPoints: function(countyPoints){
        if (!countyPoints) {
            return {};
        }   
        //state level
        const states={
            type: "states",
        }
        // nation level
        const nations = {
            type: "nations",
        }


        for (const point of countyPoints) {
            if (Number.isNaN(point.stats.confirmed)) {
                console.error("got dirty data", point);
                continue;
            }
            const country = point.country;
            const province = point.province;
            const confirmed = point.stats.confirmed;
            const deaths = point.stats.deaths;
            const recovered = point.stats.recovered;
            const coordinates = point.coordinates;

            states[country] = states[country] || {}
            states[country][province] = states[country][province] || {
                confirmed: 0,
                deaths: 0,
                recovered: 0
            };

            //aggregate county data by state
            states[country][province].confirmed += confirmed
            states[country][province].deaths += deaths
            states[country][province].recovered += recovered

            states[country][province].coordinates = states[country][province].coordinates || coordinates;
            //check deaths

        }


        const results = {};
        //zoom level
        let i=1;
        //i=1-4, nation level
        //i=5-9, state level
        //i=10-20, country level
        for (; i<=4; i++) {
            results[i] = nations;
        }

        for (; i<=9; i++) {
            results[i] = states;
        }

        for (; i<=20; i++) {
            results[i] = countyPoints;
        }
        return results;
    },
    isInBoundary: function(bounds, coordinates) {
        return coordinates && bounds && bounds.nw && bounds.se && ((coordinates.longitude >= bounds.nw.lng && coordinates.longitude <= bounds.se.lng) || (coordinates.longitude <= bounds.nw.lng && coordinates.longitude >= bounds.se.lng))
            && ((coordinates.latitude >= bounds.se.lat && coordinates.latitude <= bounds.nw.lat) || (coordinates.latitude <= bounds.se.lat && coordinates.latitude >= bounds.nw.lat));
    }
  
};
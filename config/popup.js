  "use strict";

    var getLatLng = function (initiative) {
        return [initiative.lat, initiative.lng];
    };
    var getHoverText = function (initiative) {
        return initiative.name;
    };
    var prettyPhone = function (tel) {
        return tel.replace(/^(\d)(\d{4})\s*(\d{6})/, "$1$2 $3");
    };

    var getPopup = function (initiative, sse_initiatives) {
        const values = sse_initiatives.getLocalisedVocabs();
        const labels = sse_initiatives.getFunctionalLabels();
        let orgStructures = values["os:"].terms;
        let activitiesVerbose = values["aci:"].terms;
        let membershipsVerbose = values["bmt:"].terms;
        let address = "",
            street,
            locality,
            postcode,
            dotcoop =
                initiative.dataset.includes("dotcoop"),
            popupHTML =
                '<div class="sea-initiative-details">' +
                '<h2 class="sea-initiative-name">{initiative.name}</h2>' +
                "{dotcoop.domains}" +
                `<h4 class="sea-initiative-org-structure">${values["os:"].title}: ${orgStructures[initiative.regorg]}</h4>` +
                `<h4 class="sea-initiative-org-typology">${values["bmt:"].title}: ${membershipsVerbose[initiative.baseMembershipType]}</h4>` +
                `<h4 class="sea-initiative-economic-activity">${values["aci:"].title}: ${activitiesVerbose[initiative.primaryActivity]}</h4>` +
                '<h5 class="sea-initiative-secondary-activity">Secondary Activities: {initiative.secondary-activity}</h5>' +
                "<p>{initiative.desc}</p>" +
                "</div>" +
                '<div class="sea-initiative-contact">' +
                `<h3>${labels.contact}</h3>` +
                "{initiative.address}" +
                "{initiative.tel}" +
                '<div class="sea-initiative-links">' +
                "{initiative.email}" +
                "{initiative.facebook}" +
                "{initiative.twitter}" +
                "</div>" +
                "</div>";
        // All initiatives should have a name
        popupHTML = popupHTML.replace("{initiative.name}", initiative.name);
        // TODO Add org type
        if (!initiative.qualifier && initiative.orgStructure && initiative.orgStructure.length > 0) {
            let repl = initiative.orgStructure.map(OS => orgStructures[OS]).join(", ");
            popupHTML = popupHTML.replace(
                "{initiative.org-structure}",
                repl
            );
        }
        else {
            if (!initiative.qualifier && initiative.regorg) {
                popupHTML = popupHTML.replace(
                    "{initiative.org-structure}",
                    orgStructures[initiative.regorg]
                );
            } else {
                popupHTML = popupHTML.replace(
                    "Structure Type: {initiative.org-structure}",
                    initiative.qualifier ? "Structure Type: " + activitiesVerbose[initiative.qualifier] : ""
                );
            }

        }

        if (initiative.primaryActivity && initiative.primaryActivity != "") {

            popupHTML = popupHTML.replace(
                "{initiative.economic-activity}",
                activitiesVerbose[initiative.primaryActivity]
            );
        } else {
            popupHTML = popupHTML.replace(
                "Economic Activity: {initiative.economic-activity}",
                ""
            );

        }
        if (initiative.activities && initiative.activities.length > 0) {
            let repl = initiative.activities.map(AM => activitiesVerbose[AM]).join(", ");
            popupHTML = popupHTML.replace(
                "{initiative.secondary-activity}",
                repl
            );
        }
        //comment this out
        else {
            if (initiative.activity) {
                popupHTML = popupHTML.replace(
                    "{initiative.secondary-activity}",
                    orgStructures[initiative.activity]
                );
            } else {
                popupHTML = popupHTML.replace(
                    "Secondary Activities: {initiative.secondary-activity}",
                    ""
                );
            }

        }

        // memberships 
        if (initiative.baseMembershipType) {
            popupHTML = popupHTML.replace(
                "Typology: {initiative.org-baseMembershipType}",
                "Typology: " + membershipsVerbose[initiative.baseMembershipType]
            )
        }
        else {
            popupHTML = popupHTML.replace(
                "Typology: {initiative.org-baseMembershipType}", "Others"
            )
        }



        // All initiatives should have a description (this isn't true with dotcoop)
        popupHTML = popupHTML.replace("{initiative.desc}", initiative.desc || "");

        // Not all orgs have a website
        popupHTML = popupHTML.replace(
            "{dotcoop.domains}",
            initiative.www ? '<a href="' + initiative.www + '" target="_blank" >' + initiative.www + '</a>'
                : ""
        );

        // We want to add the whole address into a single para
        // Not all orgs have an address
        if (initiative.street) {
            let streetArray = initiative.street.split(";");
            for (let partial of streetArray) {
                if (partial === initiative.name) continue;
                if (street) street += "<br/>";
                street = street ? (street += partial) : partial;
            }
            address += street;
        }
        if (initiative.locality) {
            address += (address.length ? "<br/>" : "") + initiative.locality;
        }
        if (initiative.region) {
            address += (address.length ? "<br/>" : "") + initiative.region;
        }
        if (initiative.postcode) {
            address += (address.length ? "<br/>" : "") + initiative.postcode;
        }
        if (initiative.countryId) {
            const vocabUri = sse_initiatives.getVocabUriForProperty('countryId');
            const countryName = sse_initiatives.getVocabTerm(vocabUri, initiative.countryId);
            address += (address.length ? "<br/>" : "") + (countryName || initiative.countryId);
        }
        if (initiative.nongeo == 1 || !initiative.lat || !initiative.lng) {
            address += (address.length ? "<br/>" : "") + "<i>NO LOCATION AVAILABLE</i>";
        }
        if (address.length) {
            address = '<p class="sea-initiative-address">' + address + "</p>";
        }
        popupHTML = popupHTML.replace("{initiative.address}", address);

        // Not all orgs have an email
        if (initiative.email) {
            popupHTML = popupHTML.replace(
                "{initiative.email}",
                '<a class="fa fa-at" href="mailto:' + initiative.email + '" target="_blank" ></a>'
            );
        } else popupHTML = popupHTML.replace("{initiative.email}", "");

        // not all have twitter
        if (initiative.twitter) {
            popupHTML = popupHTML.replace(
                "{initiative.twitter}",
                '<a class="fab fa-twitter" href="https://twitter.com/' + initiative.twitter + '" target="_blank" ></a>'
            );
        } else popupHTML = popupHTML.replace("{initiative.twitter}", "");

        // not all have a facebook
        if (initiative.facebook) {
            popupHTML = popupHTML.replace(
                "{initiative.facebook}",
                '<a class="fab fa-facebook" href="https://facebook.com/' + initiative.facebook + '" target="_blank" ></a>'
            );
        } else popupHTML = popupHTML.replace("{initiative.facebook}", "");

        // Not all orgs have a phone number
        popupHTML = popupHTML.replace(
            "{initiative.tel}",
            // initiative.tel
            //     ? '<p class="sea-initiative-tel">' +
            //     prettyPhone(initiative.tel) +
            //     "</p>"
            //     :
            ""
        );


        return popupHTML;
    };

    module.exports = {
        getPopup: getPopup
    };

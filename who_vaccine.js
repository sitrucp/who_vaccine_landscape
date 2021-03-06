
//GET DATA=================================
// get csv files from working group github repository
// get health region lookup csv from my github repository
var file_publication_date = "https://raw.githubusercontent.com/sitrucp/who_vaccine_landscape/master/output/publication_date.csv";
var file_vaccine_detail = "https://raw.githubusercontent.com/sitrucp/who_vaccine_landscape/master/output/who_vaccines_detail.csv";
var file_vaccine_summary = "https://raw.githubusercontent.com/sitrucp/who_vaccine_landscape/master/output/who_vaccines_summary.csv";

Promise.all([
    d3.csv(file_publication_date),
    d3.csv(file_vaccine_detail),
    d3.csv(file_vaccine_summary)
]).then(function(data) {
    //everthing else below is in d3 promise scope

    // get data sets from promise
    var vaccineDetail = data[1];
    var vaccineSummary = data[2];
    
    // get PDF publication date
    var publicationDate = data[0].columns[0];

    // create source and column name concat value
    vaccineSummary.forEach(function(d) {
        d.source_column_name = d.clinical_stage + '|' + d.column_name
    });

    // get unique source and column name concat value
    //const arrayColumn = (arr, n) => arr.map(x => x[n]);
    var tableColumns = [...new Set(vaccineSummary.map(item => item.column_name))];

    var clinical_count = vaccineDetail.filter(item => item['Clinical Stage'] === 'Clinical').length;
    var preclinical_count = vaccineDetail.filter(item => item['Clinical Stage'] === 'Pre-Clinical').length;

    document.getElementById('publication_date').innerHTML += publicationDate;
    document.getElementById('clinical_count').innerHTML += clinical_count;
    document.getElementById('preclinical_count').innerHTML += preclinical_count;

   //CREATE VACCINE TABLE=================================

   $(document).ready(function () {
        var thead;
        var thead_tr;
        thead = $("<thead>");
        thead_tr = $("<tr/>");
        thead_tr.append("<th>Clinical Stage</th>");
        thead_tr.append("<th>Clinical Phase</th>");
        thead_tr.append("<th>Developer</th>");
        thead_tr.append("<th>Platform</th>");
        thead_tr.append("<th>Candiate Type</th>");
        thead_tr.append("<th>Dose Count</th>");
        thead_tr.append("<th>Dose Timing</th>");
        thead_tr.append("<th>Route</th>");
        thead_tr.append("<th>Phase 1 Desc</th>");
        thead_tr.append("<th>Phase 1/2 Desc</th>");
        thead_tr.append("<th>Phase 2 Desc</th>");
        thead_tr.append("<th>Phase 3 Desc</th>");
        thead_tr.append("<th>Coronavirus Target</th>");
        thead_tr.append("<th>Shared Platforms</th>");
        thead_tr.append("</tr>");
        thead.append(thead_tr);
        $('#clinical_table').append(thead);

        var table;
        var tbody;
        var tbody_tr;
        tbody = $("<tbody class='filter_body'>");
        $('#clinical_table').append(tbody);
        for(var i = 0; i < vaccineDetail.length; i++) {
            var obj = vaccineDetail[i];

            tbody_tr = $('<tr/>');
            tbody_tr.append("<td>" + " " + obj['Clinical Stage'] + "</td>");

            tbody_tr.append("<td><span class='stage' style='background-color:" + getColor(obj['Clinical Phase']) + ";'>" + obj['Clinical Phase'] + "</span></td >");

            tbody_tr.append("<td>" + obj['Developer'] + "</td>");
            tbody_tr.append("<td>" + obj['Platform'] + "</td>");
            tbody_tr.append("<td>" + obj['Candidate Type'] + "</td>");
            tbody_tr.append("<td>" + obj['Dose Count'] + "</td>");
            tbody_tr.append("<td>" + obj['Dose Timing'] + "</td>");
            tbody_tr.append("<td>" + obj['Route'] + "</td>");
            tbody_tr.append("<td>" + obj['Phase 1 Desc'] + "</td>");
            tbody_tr.append("<td>" + obj['Phase 1/2 Desc'] + "</td>");
            tbody_tr.append("<td>" + obj['Phase 2 Desc'] + "</td>");
            tbody_tr.append("<td>" + obj['Phase 3 Desc'] + "</td>");
            tbody_tr.append("<td>" + obj['Coronavirus Target'] + "</td>");
            tbody_tr.append("<td>" + obj['Shared Platforms'] + "</td>");
            tbody.append(tbody_tr);
        }
    });

    //CREATE COLUMN COUNT TABLES=================================
    
    $(document).ready(function () {
        // if to see if this is detail or summary page, run only on summary page
        if($('body').is('.column_counts')){
            // loop through tableColumns
            for(var i = 0; i < tableColumns.length; i++) {
                var tableColumn = tableColumns[i];
                var tableId = 'tbl_' + tableColumn.replace(" ","_");
                var sectionName = tableColumn;
                //var sectionName = stageColumn.split("|")[1];
                // filter to tableColumns
                var tableArray = vaccineSummary.filter(function(d) {
                    if (tableColumn === vaccineSummary["column_name"]) {
                        return d.column_name !== tableColumn; //False
                    } else {
                        return d.column_name === tableColumn; //True
                    }
                });
                // create table
                addTable(tableArray, tableId, sectionName);
            }
        }
    });

    function getColor(phase) {
        var colors = {
            '#264653': 'Pre-Clinical', // Charcoal
            '#e76f51': 'Phase 1', // Burnt Sienna
            '#f4a261': 'Phase 1/2', // Sandy Brown
            '#e9c46a': 'Phase 2', // Orange Yellow Crayola
            '#2a9d8f': 'Phase 3' // Persian Green
        };

        for (var color in colors) {
            if(colors[color] == phase){
                return color;
            }
        }
        return false;
    }

    // create one summary section & table per column
    function addTable(tableArray, tableId, sectionName) {
        var myTableDiv = document.getElementById("table_div");
        let tableData = tableArray.map(function(obj) {
            return {
                'Clinical Stage': obj.clinical_stage,
                'Column Name': obj.column_name,
                'Column Value': obj.column_value,
                'Candidate Count': obj.value_count
            }
        });

        var table = document.createElement('table');
        table.id = tableId;
        table.className  = "table w-auto small counttable tablesorter";
      
        var tableHead = document.createElement('thead');
        table.appendChild(tableHead);

        var tableBody = document.createElement('tbody');
        tableBody.className = "filter_body";
        table.appendChild(tableBody);
      
        // separate tables with section header
        var trHead = document.createElement('tr');
        tableHead.appendChild(trHead);
        
        var header_data = Object.keys(tableData[0]);
        
        // get thead th values
        for (var j = 0; j < header_data.length; j++) {
            var th = document.createElement('th');
            th.appendChild(document.createTextNode(header_data[j]));
            trHead.appendChild(th);
        }

        for (var i = 0; i < tableData.length; i++) {
            var table_data = Object.values(tableData[i]);
            
            // separate tables with section header
            var trBody = document.createElement('tr');
            tableBody.appendChild(trBody);
      
            // get body values
            for (var j = 0; j < table_data.length; j++) {
                var td = document.createElement('td');
                td.appendChild(document.createTextNode(table_data[j]));
                trBody.appendChild(td);
            }
        }

        sectionHeader = '<h5>' + sectionName + ' (' + tableArray.length + ')' + '</h5>';
        myTableDiv.insertAdjacentHTML( 'beforeend', sectionHeader );
        myTableDiv.appendChild(table);
      }

    // buttons to filter table rows clinical and preclinical
    $(document).ready(function($) {
        $("#clinical_table").tablesorter();
        $(".counttable").tablesorter();

        $("#btn_clinical").click(function () {
            var rows = $(".filter_body").find("").hide();
            rows.filter(":contains('Pre-Clinical')").show();
         });

        $("#btn_clinical").click(function () {
            var rows = $(".filter_body").find("tr").hide();
            rows.filter(":contains(' Clinical')").show();
        });

        $("#btn_preclinical").click(function () {
            var rows = $(".filter_body").find("tr").hide();
            rows.filter(":contains('Pre-Clinical')").show();
        });

        $('#btn_all').click(function(){
            $('tbody > tr').show();
        });
    });

    // clinical table input form filter & reset
    $(function() {
        $("#clinical_filter").on("keyup", function() {
            var value = $(this).val().toLowerCase();
            $("#clinical_table > tbody > tr").filter(function() {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
        });
    });
    $('#clinical_filter_reset').click(function(){
        $('tbody > tr').show();
    });

    // preclinical table input form filter & reset
    $(function() {
        $("#preclinical_filter").on("keyup", function() {
            var value = $(this).val().toLowerCase();
            $(".counttable > tbody > tr").filter(function() {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
        });
    });
    $('#preclinical_filter_reset').click(function(){
        $('tbody > tr').show();
    });

});



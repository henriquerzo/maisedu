﻿
var svg;
var indicadores_selecionados = ["numero.matriculas", "IFDM", "receita"];
var cores = ["#A6CEE3","#1F78B4","#B2DF8A","#33A02C","#FB9A99","#E31A1C","#FFFF99","#FDBF6F","#FF7F00","#CAB2D6","#6A3D9A"];
var legenda = ["Indicador","Receita","Número Matrículas","IFDM"];
	
var m = [30, 10, 10, 10],
    w = 960 - m[1] - m[3],
    h = 500 - m[0] - m[2];

var x = d3.scale.ordinal().rangePoints([0, 770], 1),
    y = {},
    dragging = {};

var line = d3.svg.line(),
    axis = d3.svg.axis().orient("left"),
    foreground;

function position(d) {
  var v = dragging[d];
  return v == null ? x(d) : v;
}


// Returns the path for a given data point.
function path(d) { 
  return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
}

function parallel_graph(nome_cidade,indicador,lista_cidades,ano, div){
	lista_cidades.push(nome_cidade);
	if(indicadores_selecionados.length == 3 && (ano == "2011")){
		indicadores_selecionados.push(indicador);
		if(legenda.length == 3)legenda = ["Indicador","Receita","Número Matrículas","IFDM"];
	}else{
		indicadores_selecionados = indicadores_selecionados.slice(0,3);
		if((ano == "2011")){
			indicadores_selecionados.push(indicador);
			if(legenda.length == 3)legenda = ["Indicador","Receita","Número Matrículas","IFDM"];
		}else{
			legenda = ["Receita","Número Matrículas","IFDM"];
		}
	}
	
	
	
	var container = d3.select(div);
	container.select("#plotSimilares").remove();
	svg = container.append("svg:svg")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
    .attr("id","plotSimilares")
    .append("svg:g")	
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

	d3.csv("data/numero.matriculas_IFDM_e_receita_agregados.csv", function(cidades) {
	
		cidades = cidades.filter(function(d){ return ((lista_cidades.indexOf(d.NOME_MUNICIPIO) > -1) && 
														d[indicadores_selecionados[0]] != "NA" && 
														d[indicadores_selecionados[1]] != "NA" &&
														d[indicadores_selecionados[2]] != "NA" &&
														d[indicadores_selecionados[3]] != "NA")});
		

		// Extract the list of dimensions and create a scale for each.
		  x.domain(dimensions = d3.keys(cidades[0]).filter(function(d) {
			return (indicadores_selecionados.indexOf(d) > -1) && (y[d] = d3.scale.linear()
				.domain([0,((d3.max(cidades, function(p) {return (+p[d]); }))) + 0.1*((d3.max(cidades, function(p) {return (+p[d]); })))])
				.range([h, 0]));
				
		  }));

		lista_cidades = (cidades.map(function(d){return (d.NOME_MUNICIPIO);}));
		
		foreground = svg.append("svg:g")
			.attr("class", "foreground")
			.selectAll("path")
			.data(cidades)
			.enter().append("svg:path")
			.attr("d", path);
		
		for(var i = 0; i < cidades.length; i++){
			svg.append("path")
			 .attr("class", "foreground")
			 .attr("d", path(cidades[i]))
			 .attr("fill","none")
			 .attr("stroke-width",3)
			 .attr("stroke", cores[i]);
			 
			 svg.append("rect")
			.attr("class","rect")
			.attr("x", 690)
			.attr("y", i*20)
			.attr("width", 15)
			.attr("height", 3)
			.style("fill", cores[i]);
		}
		
		
		var legend = svg.selectAll("g.legend")
					.data(lista_cidades)
					.enter().append("svg:g")
					.attr("class", "legend")
					.attr("transform", function(d, i) { return "translate("+ 700 +"," + (i * 20) + ")"; });
					
		legend.append("svg:text")
			.attr("x", 12)
			.attr("dy", ".31em")
			.text(function(d) { return d; });

		  // Add a group element for each dimension.
		var g = svg.selectAll(".dimension")
			.data(dimensions)
			.enter().append("svg:g")
			.attr("class", "dimension")
			.attr("transform", function(d) { return "translate(" + x(d) + ")"; });

		  // Add an axis and title.
		g.append("svg:g")
			.attr("class", "axis")
			.each(function(d) { d3.select(this).call(axis.scale(y[d])); })
			.append("svg:text")
			.data(legenda)
			.attr("text-anchor", "middle")
			.attr("y", -9)
			.text(String);
		

});
}
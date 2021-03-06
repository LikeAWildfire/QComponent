def Page main
	public String icon: "https://maps.gstatic.com/mapfiles/ms2/micons/cabs.png"
	title: Карта туриста
	width:100%
	height:100%

	HBox// hbox
		flexDefinition: 293* 1* 400
		height: 100%
		width: 100%

		GeoMap gm:
			zoom: 11
			home: [55.794425,37.587836]
			pins: {{[list.selectedItem]}}
			height: 100%
			width: 100%

		div
			width:100%
			height:100%
			background: black

		div
			height: 100%
			width: 100%
			overflow: auto
			ListBox list:
				itemTemplate:
					div: {{name}}
					   padding: 12px
				itemSource: [
					{
					  name: 'Такси',
					  icon: main.icon,
					  coords: [55.751617, 37.617887],
					  route: [55.794425,37.587836],
					  moving: true
					},
					{name:'Кремль', coords:[55.751617, 37.617887]},
					{name:'Поклонная гора', coords:[55.734076, 37.516858]},
					{name:'Офис Квокки',coords:[55.773381, 37.621968]},
					{name:'Железнодорожное кольцо',coords:[55.520779, 37.546269]},
					{name:'Парк отдыха "Сокольники"',coords:[55.795549, 37.673884]},
					{name:'Воробьевы горы',coords:[55.709588, 37.564691]},
					{name:'Парк Горького',coords:[55.729435, 37.601150]},
					{name:'Сад Эрмитаж',coords:[55.770494, 37.608519]},
					{name:'Парк Победы',coords:[55.731841, 37.506587]},
					{name:'Тимирязевский парк',coords:[55.819574, 37.544653]}
				]
			input buttonRoute: Как добраться
				margin: 12px
				padding: 12px
				width: 376px
				type: button
				enabled: {{ gm.ready }}
				.click: ()->{
					var from = gm.home;
					var to = gm.pins[0].coords;

					if(to) { gm.makeRoute(from, to); }
					}
				
			input: Увеличить
				margin: 12px
				padding: 12px
				width: 376px
				type: button
				enabled: {{ gm.ready }}
				.click: ()=>{
					var newZoom = gm.zoom + 1;
					gm.zoom = newZoom;
				}
			input: Уменьшить
				margin: 12px
				padding: 12px
				width: 376px
				type: button
				enabled: {{ gm.ready }}
				.click: ()=>{
					var newZoom = gm.zoom - 1;
					gm.zoom = newZoom;
				}
			input: 'Карты yandex'
				margin: 12px
				padding: 12px
				width: 376px
				type: button
				enabled: {{ gm.ready }}
				.click: ()=>
					gm.type = 'yandex'									
				
			input: Карты google
				margin: 12px
				padding: 12px
				width: 376px
				type: button
				enabled: {{ gm.ready }}
				.click: ()=>
					gm.type = 'google'
				
			input: Показать меня
				margin: 12px
				padding: 12px
				width: 376px
				type: button
				enabled: {{ gm.ready }}
				.click: ()=>{
					var home = gm.home;                    
					gm.center = home;
				}
			input: Вывести мое положение
				margin: 12px
				padding: 12px
				width: 376px
				type: button
				enabled: {{ gm.ready }}
				.click: ()=>{
					var center = gm.center;                    
				}
			ListBox:
				overflow: auto
				itemSource: {{gm.moveList}}
				margin: 12px

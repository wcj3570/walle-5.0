	
	var refreshCurrentTabWhenMenuSelected = false;
	var currentUser;
	
	$(function() {
		
		WlUserManager.getCurrentUser(function(result) {
			currentUser = result;
			AUTHORIZED_FUNCTIONS = currentUser.authorizedFunctions;

			if (devMode) {
				if (checkFunctionAuthorization("DEV_MODE")) {
					var title = document.title;
					title += "（开发模式）";
					document.title = title;
				} else {
					alert("您没有授权进入开发模式");
					window.location.href = contextPath;
				}
			}
		});
		
		LoginManager.getMainMenus(function(result) {
			var roots = [];
			var rootsMap = {};
			$.each(result, function(index, menu) {
				if (menu.parentId == "1" || (menu.parentId == "0" && menu.funcId != "1")) {
					roots.push(menu);
					rootsMap[menu.funcId] = menu;
				}
			});
			$.each(result, function(index, menu) {
				if (menu.parentId != "1" && menu.parentId != "0") {
					var parent = rootsMap[menu.parentId];
					if (! parent) {
						return;
					}
					if (! parent.children) {
						parent.children = [];
					}
					parent.children.push(menu);
				}
			});
			
			var menulist = "";
			$.each(roots, function(i, n) {
				menulist += "<div title='"+n.name+"' icon='icon icon-sys'><ul>";
				if (n.children) {
			        $.each(n.children, function(j, o) {
			        	if(o.state!=0){
			        		menulist += "<li><div><a ref='"+o.funcId+"' href='#' rel='" + (o.viewname || "") + "' type='" + o.funcType + "'><span class='icon icon-nav' >&nbsp;</span><span class='nav'>" + o.name + "</span></a></div></li> ";
			        	} else {
			        		menulist += "<li><div><a ref='"+o.funcId+"' disabled = 'true' href='#' rel='" + (o.viewname || "") + "' type='" + o.funcType + "'><span class='icon icon-nav' >&nbsp;</span><span class='nav' style='color:#aaaaaa;' >" + o.name + "</span></a></div></li> ";
			        	}
			        	
						
			        });
				}
				menulist += "</ul></div>";
		    });
			$("#nav").html(menulist).accordion();
		    
			$("#nav").delegate("li a", "click", function(){
				var tabTitle = $(this).children(".nav").text();
				var url = $(this).attr("rel");
				var menuid = $(this).attr("ref");
				var icon = "icon icon-nav";
				var type = $(this).attr("type");
				var disabled = $(this).attr("disabled");
				if(disabled!="disabled") {
					addTab(tabTitle,url,icon,true,type,menuid);
					$("#nav li div").removeClass("selected");
					$(this).parent().addClass("selected");
				}
			}).delegate("li a", "hover", function(){
				$(this).parent().toggleClass("hover");
			});
		
		});
		
		/*
	    $(".layout-button-left").one("click", function() {
		    $(".layout-expand .panel-body").mouseenter(function() {
				$(this).click();
		    });
	    });
		*/

		$("#maintabs").tabs("bind", {
			onContextMenu : function(e, title) {
				$("#mm").menu("show", {
					left: e.pageX,
					top: e.pageY
				});
				if ($("#maintabs").tabs("getSelected").panel("options").title != title) {
					$("#maintabs").tabs("select",title);
				}
			}
		}).delegate(".tabs-inner", "dblclick", function(){
			if ($(this).closest(".easyui-tabs").attr("id") != "maintabs") {
				return;
			}
			var subtitle = $(this).children(".tabs-closable").text();
			$("#maintabs").tabs("close",subtitle);
		});
		
		//刷新
		$("#mm-tabupdate").click(function(){
			refreshCurrentTab();
		});
		//关闭当前
		$("#mm-tabclose").click(function(){
			var currtab = $("#maintabs").tabs("getSelected");
			if (currtab.panel("options").closable) {
				$("#maintabs").tabs("close", currtab.panel("options").title);
			}
		});
		//全部关闭
		$("#mm-tabcloseall").click(function(){
			$(".tabs-inner .tabs-closable").each(function(i,n){
				var t = $(n).text();
				$("#maintabs").tabs("close",t);
			});
		});
		//关闭除当前之外的TAB
		$("#mm-tabcloseother").click(function(){
			$("#mm-tabcloseright").click();
			$("#mm-tabcloseleft").click();
		});
		//关闭当前左侧的TAB
		$("#mm-tabcloseleft").click(function(){
			var prevall = $(".tabs-selected").prevAll();
			if(prevall.length==0){
				return false;
			}
			prevall.each(function(i,n){
				var t=$("a:eq(0) .tabs-closable",$(n)).text();
				$("#maintabs").tabs("close",t);
			});
			return false;
		});
		//关闭当前右侧的TAB
		$("#mm-tabcloseright").click(function(){
			var nextall = $(".tabs-selected").nextAll();
			if(nextall.length==0){
				return false;
			}
			nextall.each(function(i,n){
				var t=$("a:eq(0) .tabs-closable",$(n)).text();
				$("#maintabs").tabs("close",t);
			});
			return false;
		});
		//在新窗口中打开
		$("#mm-newwindow").click(function() {
			openCurrentTabInNewWindow(); 
		});
		//取消
		$("#mm-cancel").click(function(){
			$("#mm").menu("hide");
		});
		
		//用户信息
		$("#btnEdituser").click(function() {
			openWindow(null, "用户信息", "walle-system/jsp/userInfo.jsp", "ajax", {
				width : 400,
				height : 280,
				onClose : function() {
					$("#btnEdituser").html(currentUser.fullname);
				}
			});
		});
		
		//修改密码
		$("#btnEditpass").click(function() {
			openWindow(null, "修改密码", "walle-system/jsp/editPass.jsp", "ajax", {
				width : 400,
				height : 210
			});
		});
	
	});
	
	function addTab(subtitle,url,icon,closable,type,menuid) {
		if(!$("#maintabs").tabs("exists",subtitle)){
			var tab = {
				title:subtitle,
				closable:closable,
				icon:icon
			};
			//type : iframe, ajax, dynamic
			if (type == "iframe") {
				tab.content = createTabIframe(url);
				$("#maintabs").tabs("add", tab);
			} else {
				if (type == "dynamic") {
					url = getDynamicPageUrl(url || menuid);
				}
				if (debugMode) {
					tab.content = createTabIframe("ajaxPageWrapper.jsp?_ajaxPageUrl=" + url);
				} else {
					tab.href = url;
				}
				$("#maintabs").tabs("add", tab);
			}
			//$("#maintabs").tabs("add", tab);
		}else{
			$("#maintabs").tabs("select",subtitle);
			if (refreshCurrentTabWhenMenuSelected) {
				refreshCurrentTab();
			}
		}
	}
	
	function openWindow(parent,subtitle,url,type,options) {
		//always use body as parent
		parent = null;
		
		options = options || {};
		var onClose = options.onClose;
		delete options.onClose;
		win = $.extend({}, {
			modal : true,
			title : subtitle,
			iconCls : "myCustomerIcon_searchForm",
			onClose : function() {
				if (onClose) {
					onClose.apply(this);
				}
				$(this).dialog("destroy");
			}
		}, options);
		//type : iframe, ajax, dynamic
		if (type == "iframe") {
			win.content = createTabIframe(url);
		} else {
			if (type == "dynamic") {
				url = getDynamicPageUrl(url);
			}
			if (debugMode) {
				win.content = createTabIframe("ajaxPageWrapper.jsp?_ajaxPageUrl=" + url);
			} else {
				win.href = url;
			}
		}
		return $("<div/>").appendTo(parent || "body").dialog(win);
	}
	
	function getTab(subtitle) {
		var tab = $("#maintabs").tabs("getTab",subtitle);
		if (tab.children().eq(0).is("iframe")) {
			return $(tab.find("iframe")[0].contentWindow.document.body);
		} else {
			return tab;
		}
	}
	
	function getCurrentTabTitle() {
		var currTab = $("#maintabs").tabs("getSelected");
		return currTab.panel("options").title;
	}
	
	function refreshCurrentTab() {
		var currTab = $("#maintabs").tabs("getSelected");
		if (currTab.panel("options").href) {
			currTab.panel("refresh");
		} else {
			var url = $(currTab.panel("options").content).attr("_src");
			$("#maintabs").tabs("update",{
				tab:currTab,
				options:{
					content:createTabIframe(url)
				}
			});
		}
	}
	
	function openCurrentTabInNewWindow() {
		var currTab = $("#maintabs").tabs("getSelected");
		var title = currTab.panel("options").title;
		var url;
		if (currTab.panel("options").href) {
			url = "ajaxPageWrapper.jsp?_title=" + encodeURI(encodeURI(title)) + "&_ajaxPageUrl=" + currTab.panel("options").href;
		} else {
			url = $(currTab.panel("options").content).attr("_src");
		}
		var win = window.open("", title);
		win.focus();
		win.location.href = url;
	}
	
	function createTabIframe(url) {
		var _url = url + (/\?/.test(url) ? "&" : "?") + "_=" + $.now();
		return "<iframe scrolling='auto' frameborder='0' src='" + _url + "' _src='" + url + "' style='width:100%;height:100%;'></iframe>";
	}
	
	function getTabIframe(subtitle) {
		return $("#maintabs").tabs("getTab",subtitle).find("iframe")[0].contentWindow;
	}
	
	//根据title 关闭tab
	function colseTabByTitle(title){
		$("#maintabs").tabs("close",title);
	}
	
	//根据title刷新tab
	function refreshTabByTitle(title){
		var selectTab=$("#maintabs").tabs("getTab",title);
		if (selectTab.panel("options").href) {
			selectTab.panel("refresh");
		} else {
			var url = $(selectTab.panel("options").content).attr("_src");
			$("#maintabs").tabs("update",{
				tab:selectTab,
				options:{
					content:createTabIframe(url)
				}
			});
			
		}
	}


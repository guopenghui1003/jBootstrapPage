(function($) {
    $.fn.jBootstrapPage = function(config) {

        if (this.size() != 1)
            $.error('请为这个插件提供一个唯一的编号');
        
        var c = {
        	pageSize : 10,
        	total : 0,
        	maxPages : 1,
        	realPageCount : 1,
        	lastSelectedIndex : 1,
        	selectedIndex : 1,
        	maxPageButton: 3,
        	onPageClicked : null,
            onJumpClicked:null,
            firstText:"<<",
            lastText:">>",
            preText:"上一页",
            nextText:"下一页",
            jumpBtnText:"跳转",
            jumpFlagText:"页"
        };
        
        var firstBtn, preBtn, nextBtn, lastBtn;
        
        return this.each(function() {
            var $this = $(this);
            $this.empty();
            function isNoNumber(txt){
                if(/^[0-9]*[1-9][0-9]*$/.test(txt)){
                    return false;
                }else{
                    return true;//不是正整数
                }
            }
            if (config){ $.extend(c, config);}
            if(isNoNumber(c.maxPageButton) || isNoNumber(c.total) || isNoNumber(c.pageSize)){return;}//防止输入的不是数字
            
            init();
            bindALL();
            var JumpClickedTrue=false;//标识那类按钮单击
            
            function init() {
            	//$this.find('li').remove();
                
            	c.maxPages = Math.ceil(c.total/c.pageSize);
                if(c.maxPages < 1){return;}
            	
            	
            	$this.append('<li class="disabled"><a class="first" href="#">'+c.firstText+'</a></li>');
            	$this.append('<li class="disabled"><a class="pre" href="#">'+c.preText+'</a></li>');
        		
        		var pageCount = c.maxPages < c.maxPageButton ? c.maxPages : c.maxPageButton;
        		var pNum = 0;
        		for(var index = 1; index <= pageCount; index++) {
        			pNum++;
        			$this.append('<li class="page" pNum="'+pNum+'"><a href="#" page="'+index+'">'+index+'</a></li>');
        		}
        		
        		$this.append('<li ><a class="next" href="#">'+c.nextText+'</a></li>');
        		$this.append('<li><a class="last" href="#">'+c.lastText+'</a></li>');

                //添加跳转html
                var jumpHTML='<div style="display:inline-block;">'+
                            '<span id="jumpBtnId"   style="color:#428bca;display: inline;margin-left: 10px;border-top-left-radius: 4px;border-bottom-left-radius: 4px;border: 1px solid #ddd;padding: 8px 12px 9px 12px;cursor:not-allowed;">'+c.jumpBtnText+'</span>'+
                            '<input id="jumpInputId" type="text" style="color:#428bca;text-align:center;display: inline;width:30px;font-size: 18px;margin: 0;border: 1px solid #ddd;padding: 6px 12px 6px 12px;">'+
                            '<span style="color:#428bca;display: inline;margin-left: 0;border-top-right-radius: 4px;border-bottom-right-radius: 4px;border: 1px solid #ddd;padding: 8px 12px 9px 12px;">'+c.jumpFlagText+'</span>'+
                        '</div>';
                $this.append(jumpHTML);
                $("#jumpBtnId").prop("disabled",true);

                /*if(c.maxPageButton > c.maxPages) {
        			$this.find('li a.next').parent().addClass("disabled");
            		$this.find('li a.last').parent().addClass("disabled");
            	}else {
            		$this.find('li a.next').parent().removeClass("disabled");
            		$this.find('li a.last').parent().removeClass("disabled");
            	}*/
                if(c.maxPages==1){//only one page 
                    $this.find('li a.next').parent().addClass("disabled");
                    $this.find('li a.last').parent().addClass("disabled");
                }
        		
        		$this.find('li:nth-child(3)').addClass('active');
        		
        		firstBtn = $this.find('li a.first').parent();
        		preBtn = $this.find('li a.pre').parent();
        		lastBtn = $this.find('li a.last').parent();
        		nextBtn = $this.find('li a.next').parent();
            }
            
            function mathPrePage(currButtonNum, currPage, maxPage, showPage) {
            	if(maxPage < 1) return; 
            	
            	//选中的按钮大于中间数，就进一位
            	var middle = Math.ceil(showPage/2); // 4
            	// 4 > 3
            	// 5 - 4 + 3 
            	if(currButtonNum != currPage && currButtonNum < middle) {
            		$this.find('li.page').remove();
            		
            		//1 2 3 4 5 6 7 8 9 10
            		//   
            		var endPages = currPage + Math.floor(middle/2);
            		if(endPages < c.maxPageButton) endPages = c.maxPageButton+1;
            		
            		var startPages = endPages - c.maxPageButton;
            		
            		if(startPages <= 0)startPages = 1;
            		
            		if(endPages - startPages >= c.maxPageButton) {
            			var d = endPages - startPages - c.maxPageButton;
            			if(d == 0) d = 1;
            			endPages -= d;
            		} 
            		
            		var pNum = 0;
            		var html = '';
                    if(currButtonNum==1){//first page exception
                        endPages=maxPage>showPage?showPage:maxPage;
                    }
            		for(var index = startPages; index <= endPages; index++) {
            			pNum++;
            			html += '<li class="page" pNum="'+pNum+'"><a href="#" page="'+index+'">'+index+'</a></li>';
            		}
            		
            		$this.find('li:nth-child(2)').after(html);
            		
            		bindPages();
            	}
            }
            
            function mathNextPage(currButtonNum, currPage, maxPage, showPage) {
            	if(maxPage < 1) return; 
            	var offsetRight = 2;
            	//选中的按钮大于中间数，就进一位
            	var middle = showPage - 1; // 4
            	// 4 > 3
            	// 5 - 4 + 3 
            	
            	if((currButtonNum != currPage+1 || maxPage > showPage) && currButtonNum >= middle) {
            		//显示后面2个按钮
            		var startPages = currPage - offsetRight;
            		var endPages = currPage + middle;
            		
            		endPages = endPages >= maxPage ? maxPage : endPages;
            		
            		if(endPages <= c.maxPageButton) endPages = c.maxPageButton;
            		
            		if(endPages - startPages >= c.maxPageButton) {
            			var d = endPages - startPages - c.maxPageButton;
            			endPages -= d;
            		} 
            		
            		if(endPages == maxPage)endPages++;
            		
            		if(endPages - startPages < c.maxPageButton) {
            			var d = c.maxPageButton - (endPages - startPages); 
            			startPages -= d;
            		}
            		
            		var pNum = 0;
            		var html = '';
            		for(var index = startPages; index < endPages; index++) {
            			pNum++;
            			html += '<li class="page" pNum="'+pNum+'"><a href="#" page="'+index+'">'+index+'</a></li>';
            		}
            		
            		$this.find('li.page').remove();
            		$this.find('li:nth-child(2)').after(html);
            		
            		bindPages();
            	}
            	
            	
            	
            	
            	/*if((currButtonNum != currPage+1 || maxPage > showPage) && currButtonNum > middle) {
            		var startPages = currPage - middle + offsetRight;
            		
            		var endPages = currPage + middle + offsetRight;
            		endPages = endPages > maxPage ? maxPage : endPages;
            		
            		if(endPages < c.maxPageButton) endPages = c.maxPageButton;
            		
            		if(endPages - startPages > c.maxPageButton) {
            			var d = endPages - startPages - c.maxPageButton;
            			endPages -= d;
            		} 
            		
            		if(endPages - startPages < c.maxPageButton) {
            			var d = c.maxPageButton - (endPages - startPages); 
            			startPages -= d;
            		}
            		
            		var pNum = 0;
            		var html = '';
            		for(var index = startPages; index < endPages; index++) {
            			pNum++;
            			html += '<li class="page" pNum="'+pNum+'"><a href="#" page="'+index+'">'+index+'</a></li>';
            		}
            		
            		$this.find('li.page').remove();
            		$this.find('li:nth-child(2)').after(html);
            		
            		bindPages();
            	}*/
            }
            
            function onClickPage(pageBtn) {
            	c.lastSelectedIndex = c.selectedIndex;
            	c.selectedIndex = parseInt(pageBtn.text());
            	
            	if(c.onPageClicked && !JumpClickedTrue) {
            		c.onPageClicked.call(this, $this, c.selectedIndex-1);
            	}else  if(c.onJumpClicked && JumpClickedTrue && !($("#jumpBtnId").prop("disabled")) ){//跳转回调
                    c.onJumpClicked.call(this, $this, c.selectedIndex-1);
                    JumpClickedTrue=false;
                }
            	
            	$this.find('li.active').removeClass('active');
            	pageBtn.parent().addClass('active');
            	
            	if(c.selectedIndex > 1) {
            		if(preBtn.hasClass('disabled')) {
	            		firstBtn.removeClass("disabled");
	            		preBtn.removeClass("disabled");
	            		
	            		bindFirsts();
            		}
            	}else {
            		if(!preBtn.hasClass('disabled')) {
            			firstBtn.addClass("disabled");
            			preBtn.addClass("disabled");
            		}
            	}
            	
            	if(c.selectedIndex >= c.maxPages) {
            		if(!nextBtn.hasClass('disabled')) {
            			nextBtn.addClass("disabled");
            			lastBtn.addClass("disabled");
            		}
            	}else {
            		if(nextBtn.hasClass('disabled')) {
            			nextBtn.removeClass("disabled");
            			lastBtn.removeClass("disabled");
            		
            			bindLasts();
            		}
            	}
            }
            
            function onPageBtnClick($_this) {
            	var selectedText = $_this.text();
            	var selectedBtn = $this.find('li.active').find('a');
            	
            	if(selectedText == c.nextText) {//'下一页' next button   
            		var selectedIndex = parseInt(selectedBtn.text());
            		var selectNum = parseInt($this.find('li.active').attr('pNum'))+1;
            		if(selectNum > c.maxPageButton) selectNum = c.maxPageButton-1;
            		
            		if(selectedIndex > 0) {
            			mathNextPage(selectNum, selectedIndex, c.maxPages, c.maxPageButton);
            			selectedBtn = $this.find('li.page').find('a[page="'+(selectedIndex+1)+'"]');
            		}
            	}
            	else if(selectedText == c.lastText){//末页 last button   
                    var selectNum=c.maxPages;
                    var selectedIndex=c.maxPages-1;
                    mathNextPage(selectNum, selectedIndex, c.maxPages, c.maxPageButton);
                    selectedBtn = $this.find('li.page').find('a[page="'+(selectedIndex+1)+'"]');
                }
                else if(selectedText == c.preText) {//'上一页' pre button   
            		var selectedIndex = parseInt(selectedBtn.text())-1;
            		var selectNum = parseInt($this.find('li.active').attr('pNum'))-1;
            		if(selectNum < 1) selectNum = 1;
            		
            		mathPrePage(selectNum, selectedIndex, c.maxPages, c.maxPageButton);
            		selectedBtn = $this.find('li.page').find('a[page="'+(selectedIndex)+'"]');
            	}
            	else if(selectedText == c.firstText){//首页 first button   
                    var selectNum=1;
                    var selectedIndex=2;
                    mathPrePage(selectNum, selectedIndex, c.maxPages, c.maxPageButton);
                    selectedBtn = $this.find('li.page').find('a[page="'+(selectNum)+'"]');
                }
                else if(selectedText == c.jumpBtnText){//跳转 jump button 
                    JumpClickedTrue=true;
                    var inputVal=$("#jumpInputId").val();
                    inputVal=parseInt(inputVal.replace(/\b(0+)/gi,""));
                    if(c.maxPages>=inputVal&&inputVal>1){
                        var selectNum=inputVal;
                        var selectedIndex=inputVal-1;
                        if(inputVal >= Math.floor((c.maxPages>c.maxPageButton?c.maxPageButton:c.maxPages)/2)){
                            mathNextPage(selectNum, selectedIndex, c.maxPages, c.maxPageButton);
                        }else{
                            mathPrePage(selectNum, selectedIndex, c.maxPages, c.maxPageButton);
                        }
                        selectedBtn = $this.find('li.page').find('a[page="'+(selectNum)+'"]');
                    }else if(inputVal==1){
                        var selectNum=1;
                        var selectedIndex=2;
                        mathPrePage(selectNum, selectedIndex, c.maxPages, c.maxPageButton);
                        selectedBtn = $this.find('li.page').find('a[page="'+(selectNum)+'"]');
                    }
                }
                else{
            		selectedBtn = $_this;
            	}
            	
            	onClickPage(selectedBtn);
            }
            
            function bindPages() {
            	$this.find("li.page a").each(function(){
            		if($(this).parent().hasClass('disabled')) return;
            		
            		$(this).on('pageClick', function(e) {
            			onPageBtnClick($(this));
            		});
                });
            	
                $this.find("li.page a").click(function(e){
                	e.preventDefault();
                	
                	$(this).trigger('pageClick', e);
                });
            }
            
            function bindFirsts() {
            	$this.find("li a.first,li a.pre").each(function() {
            		if($(this).parent().hasClass('disabled')) return;
            		
            		$(this).unbind('pageClick');
            		$(this).on('pageClick', function(e) {
            			onPageBtnClick($(this));
            		});
                });
            }
            
            function bindLasts() {
            	$this.find("li a.last,li a.next").each(function() {
            		if($(this).parent().hasClass('disabled')) return;
            		
            		$(this).unbind('pageClick');
            		$(this).on('pageClick', function(e) {
            			onPageBtnClick($(this));
            		});
                });
            }
            
            function bindALL() {
            	$this.find("li.page a,li a.first,li a.last,li a.pre,li a.next").each(function() {
            		if($(this).parent().hasClass('disabled')) return;
            		$(this).on('pageClick', function(e) {
            			onPageBtnClick($(this));
            		});
                });
            	
                $this.find("li.page a,li a.first,li a.last,li a.pre,li a.next").click(function(e) {
                	e.preventDefault();
                	
                	if($(this).parent().hasClass('disabled')) return;
                	$(this).trigger('pageClick', e);
                });
            }
            //跳转绑定
            function bindJump(){
                $("#jumpBtnId").on('pageClick', function(e) {
                    if($(this).prop('disabled')) return;
                    onPageBtnClick($(this));
                });
                $("#jumpBtnId").click(function(e) {
                    e.preventDefault();
                    if($(this).prop("disabled")){ return;}
                    $(this).trigger('pageClick', e);
                });
                $("#jumpInputId").keyup(function(e){
                    //判断输入的是否为正整数
                    var inputVal=$("#jumpInputId").val();
                    var tf=/^[0-9]*[1-9][0-9]*$/.test(inputVal);
                    var jumpBtnObj=$("#jumpBtnId");
                    if(tf&&c.maxPages>=inputVal){
                        jumpBtnObj.prop("disabled",false);
                        jumpBtnObj.css("cursor","pointer");
                    }else{
                        jumpBtnObj.prop("disabled",true);
                        jumpBtnObj.css("cursor","not-allowed");
                    }
                    if(e.keyCode==13){
                        if(c.maxPages>=parseInt(inputVal)){ $("#jumpBtnId").click(); }
                    }
                });
            }
            bindJump();
        });
    };
})(jQuery);

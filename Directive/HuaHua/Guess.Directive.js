var GuessDir = {};

GuessDir.SetTimeOutObj =  new Array();

GuessDir.HongBaoChongZhi_Lock = false;

GuessDir.TiJiaoDaAn_Lock = false;
 

//微信回调：正式提交答案
GuessDir.UpdateWxResult3 = function(res,myData)
{
	//解锁
	GuessDir.TiJiaoDaAn_Lock = false;
	
	if(res.err_msg.indexOf("ok") >= 0)
	{				
		$.ajax
		({
			data: 
				{
					type:"TiJiaoDaAn",
					content:myData.content,
					order:myData.order,
					money:myData.money 
				},
			success:function(mydata)
			{
				
				var json = JSON.parse(mydata);	
				var price = json["Result"].price;		//如果用户回答正确，获取的奖励
				var tips =  json["Result"].tips;		//暂时没有用到
				var info = "";								
				if(price != 0) { info = "获得 ￥" + (price/100) + "元红包，请前往<a href='http://mp.weixin.qq.com/s?__biz=MzI3MTIxOTU1Mg==&mid=100000002&idx=2&sn=6e5b8b35f2d2724fab8b5f42a8d53bed#rd'>用户中心</a>查看"; }
				else { info = "红包已被领完，答题花费的金额已退入您的<a href='http://mp.weixin.qq.com/s?__biz=MzI3MTIxOTU1Mg==&mid=100000002&idx=2&sn=6e5b8b35f2d2724fab8b5f42a8d53bed#rd'>用户中心</a>"; }
				$("#submit").addClass("ui-state-disabled").unbind("tap",Send);	 
				if(json.Status == "成功")
				{
					if(json.Result.flag == 0)
					{
						//...回答错误
						layer.open ({  title:"信息", content:"回答错误 </br> 请查看答案提示，稍后再接再厉",btn: ['好的'],yes:function(index) { location.reload(); layer.close(index); },end:function(index) { location.reload(); layer.close(index); }  });
					}
					else
					{
						//...回答正确
						layer.open ({ title:"信息", content:"回答正确 </br>" + info,btn: ['好的'],yes:function(index) { location.reload(); layer.close(index); },end:function(index) { location.reload(); layer.close(index); } });
					}
				} 
			}
		})		
	}
	else if(res.err_msg.indexOf("fail") >= 0)
	{
		//...失败
		layer.open ({  title:"信息", content:"微信支付失败",yes:function(index) {  layer.close(index); } });
		return false;   
	}
	else if(res.err_msg.indexOf("cancel") >= 0)
	{
		//...取消
		return false;   
	}
}

//微信回调：正式添加红包或者更新画画题目的数据
GuessDir.UpdateWxResult2 = function(res,myData)
{			
	//解锁
	GuessDir.HongBaoChongZhi_Lock = false;
	
	if(res.err_msg.indexOf("ok") >= 0)
	{				
		//先关闭原来的弹窗
		$("#cy-tp-dialog2").popup('close');  
		$.ajax
		({
			data: { type:"ChongXinTianJiaHongBao", order:myData.order,HongBaoJinE:myData.HongBaoJinE,HongBaoCount:myData.HongBaoCount,model:myData.model },
			success:function(Resultdata)
			{
				var json = JSON.parse(Resultdata);
				if (json.Status == '成功') { $("#reputHongBao").addClass("ui-state-disabled").unbind("click"); layer.open ({ title: "信息", content:json.Msg,btn: ['好的'],yes:function(index) { location.reload(); layer.close(index); },end:function(index) { location.reload(); layer.close(index); }  }); }
				else { alert(json.Msg);  }
			}
		})
	}
	else if(res.err_msg.indexOf("fail") >= 0)
	{
		//...失败
		layer.open ({  title:"信息", content:"微信支付失败",yes:function(index) {  layer.close(index); } });
		return false;   
	}
	else if(res.err_msg.indexOf("cancel") >= 0)
	{
		//...取消
		return false;   
	}
}


//购买道具，购买道具，购买道具
GuessDir.UpdateWxResult = function(res,myData)
{
	//	get_brand_wcpay_request：ok 支付成功 
	//	get_brand_wcpay_request：cancel 支付过程中用户取消 
	//	get_brand_wcpay_request：fail 
	//alert("得到微信返回的对象是：" + res.err_msg); //获取微信返回结果
	
	if(res.err_msg.indexOf("ok") >= 0)
	{
		//先关闭原来的弹窗
		$("#cy-tp-dialog").popup('close');  
		$.ajax
		({
			data: { type:"GouMaiDaoJu", order:myData.order,money:myData.money,uid:myData.uid,tips_index:myData.tips_index,tips:myData.tips },
			success:function(Resultdata) 
			{
				
				
				//如果用户购买了道具，应该立即清空倒计时
				for(var i = 0;i<GuessDir.SetTimeOutObj.length;i++) { clearTimeout(GuessDir.SetTimeOutObj[i]); }
				//修改倒计时样式
		    	//$("title").text("你可以答题了"); $("#submit").text("提交").removeClass("ui-state-disabled");
				//正式后端数据
				var json = JSON.parse(Resultdata);
				//成功
				if (json.Status == '成功')
				{
					if (myData.tips != "") 
					{
						var tipsHtml = "";
						var tipsArr =myData.tips.split("");
						for(var j = 0;j<tipsArr.length;j++)
						{
							tipsHtml += "<span class='tipsFont'>" + tipsArr[j] +"</span>";
						}
						var tipsHtml = "<div class='tipsFontPanel'>" + tipsHtml + "</div>";
						
						$("#chengyutishi").show();
						$("#panelbody").append(tipsHtml);
						
						//修改成语提示
						var textlength = $("#panelbody").text().replace(/\s/g, "").length;
						$("#chengyunum").text(textlength);
						$("#chengyunum2").text(textlength/4);
					}
				}
				//失败
				else { AjaxDir.JqmAlert(json.Msg); }
			}
		})
	}
	else if(res.err_msg.indexOf("fail") >= 0)
	{
		//...失败
		layer.open ({  title:"信息", content:"微信支付失败",yes:function(index) {  layer.close(index); } });
		return false;   
	}
	else if(res.err_msg.indexOf("cancel") >= 0)
	{
		//...取消
		return false;   
	}
}


//提交画画的红包和模式的数据更新
GuessDir.DialogYes2 = function()
{
	
	if(GuessDir.HongBaoChongZhi_Lock == true)
	{
		return false; 
	}
	else
	{
		//加锁
		GuessDir.HongBaoChongZhi_Lock = true;
	}

	var myData = {};																//发送给回调函数的参数
	myData.HongBaoJinE = $("#HongBaoJinE").val();				//红包金额
	myData.HongBaoCount = 1;  											//红包个数$("#HongBaoCount").val();
	//是否推荐
	 var checkbox = $("#tuijiansf")[0];
	 var n=0;  //0 接受审核
	if(checkbox.checked) 
	{
		n="-1"; 
	}
	else
	{
		n=2;
	}
	
	
	//数据验证 ||  /^[1-9]+/.test(myData.HongBaoJinE) == false  
	// || /^[1-9]+/.test(myData.HongBaoCount) == false  
	if(myData.HongBaoJinE.length == 0)
	{
		layer.open({ title: '信息', content: '金额必须为正整数',btn:["好的"],yes:function(){layer.closeAll();}  });
		return false;
	}  
	else if(myData.HongBaoCount.length == 0) 
	{
		layer.open({ title: '信息', content: '红包数量必须为正整数',btn:["好的"],yes:function(){layer.closeAll();} });
		return false;
	}
	
	$.ajax
	({     //KO 新增加红包个数
			data: { type:"weixinzhifu2", price:myData.HongBaoJinE,cot:myData.HongBaoCount},
			success:function(dddddd)
			{  
				var obj = JSON.parse(dddddd);
				var order = obj["Result"].order;			//流水订单号
				var wxjson = obj["Result"].wxjson;		//微信核心json
				var model = obj["Result"].model;			//模式
				myData.order = order;							//将流水号插入数据集中传递给回调函数
				myData.model = n; 
				callpay(wxjson,myData,GuessDir.UpdateWxResult2);
			}
	})
}





function showtime(t)
{ 		
	//解除绑定事件
	$("#submit").addClass("ui-state-disabled").unbind("tap",Send);	
	//开始倒计时
    for(i=1;i<=t;i++) {
    		var settimeoubobj = window.setTimeout("update_p(" + i + ","+t+")", i * 1000); 
    		GuessDir.SetTimeOutObj.push(settimeoubobj);
    	}
} 



function update_p(num,t) 
{ 
    if(num == t) 
    { 
    	//倒计时完成
    	$("title").text("你可以答题了");
    	$("#submit").text("提交").removeClass("ui-state-disabled");
    } 
    else 
    { 
        printnr = t-num; 
        var content =  printnr +"秒后可重新答题"; 
        $("title").text(content);
        $("#submit").text(content);
    } 
}

function Send()
{	
	var v = $("#search").val();
	if(v.length < 4 || v.length == 0 || !/^[\u4E00-\u9FA5]+$/.test(v))
	{
		layer.open({ title: '信息', content: '请输入四字成语',btn:["好的"],yes:function(){layer.closeAll();}  });
		return false;
	} 
	else
	{
		
		if(GuessDir.TiJiaoDaAn_Lock == true)
		{
			return false;
		}
		else
		{
			GuessDir.TiJiaoDaAn_Lock = true;
		}
		
		
		$.ajax
		({   
				data: { type:"DaTiHuaXiao"},
				success:function(data)
				{  
					
					var obj = JSON.parse(data);
					var order = obj["Result"].order;			//流水订单号
					var money = obj["Result"].money;	    //需要花销的金额
					var myobj = new Object();				   //新建一个对象						
				    var wxjson = obj["Result"].wxjson;		//微信核心json
				    myobj.order = order;						   //将”流水号“插入数据集中传递给回调函数
					myobj.content = v;						   //将”用户提交的答案“插入数据集中传递给回调函数
				    myobj.money = money;				   //将”答题花销“插入数据集中传递给回调函数
				    
				    if(money != 0)
				    {
				    	callpay(wxjson,myobj,GuessDir.UpdateWxResult3);
				    }
				    else
			    	{
				    	layer.open({ title: '信息', content: '题目红包为0，答题失败!',btn:["好的"],yes:function(){layer.closeAll();} });
			    	}
				}
		})
	}
}

function reputHongBao()
{
	$("#cy-tp-dialog2").popup("open");			
	$("#Cy-tp-DialogYes2").bind("click",GuessDir.DialogYes2);		//Dialog确定按钮
}

//页面逻辑============================================
$(function()
{
	//道具购买
	$("#radio-choice-0a").bind("click",function()
	{
		//此处修改为 不弹出层在确定支付 改为直接支付
		var val=$("#radio-choice-0a").attr("data-tipstype");
		$.ajax
		({
				data: { type:"weixinzhifu"},			
				success:function(jsonstrdata)
				{ 
					var obj = JSON.parse(jsonstrdata);
					var order = obj["Result"].order;			//流水订单号
					var wxjson = obj["Result"].wxjson;		//微信核心json
					var tips = obj["Result"].tips;	
					var tips_index = obj['Result'].tips_index;
					var money =  obj["Result"].money;	//价格
					var uid = obj['Result'].uid;				//uid
					
					var myData = {};
					myData.order = order;	
					myData.money = money;
					myData.uid = uid;
					myData.tips = tips;
					myData.tips_index = tips_index;  
					
					    
					callpay(wxjson,myData,GuessDir.UpdateWxResult); 
				}
		})
	})
	
	//提交答案
	$("#submit").bind("click",Send);
	
	
	$("#share_hy").click(function() {
		$("#zhezhaocheng").width($(document).width());
		$("#zhezhaocheng").height($(document).height());
		$('html, body').animate({scrollTop:0}, 'slow');
		$("#zhezhaocheng").show();
	})
	$("#zhezhaocheng").click(function() {
		$(this).hide();
	})
	
	//KO新增 修改道具金额

	$(".jsj").click(function()
							 {	
							 $(".crrtt").removeClass("crrtt");
								 $(this).addClass("crrtt");
								 var val= $(this).attr("val");
								 $("#HongBaoJinE").val(val);
								 $("#jinddd").text(val*$("#HongBaoCount").val());
								 $("#DaoJuJinE").val(($("#HongBaoJinE").val()*3)/10);
								 $("#model_price").text(($("#HongBaoJinE").val()*3)/10);
								 })
	
	$("#HongBaoCount").blur(function()
									  {
										 
										  var val=$("#HongBaoJinE").val();
										  var cot=$("#HongBaoCount").val();
										  if(cot>100)
										  {
											  $("#HongBaoCount").val(100);
											  }
										   $("#jinddd").text(val*$("#HongBaoCount").val());
										  })
})


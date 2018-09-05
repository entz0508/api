<?
session_start();
if(!isset($_SESSION['user_login']) || !isset($_SESSION['user_name'])) {
	echo "<meta http-equiv='refresh' content='0;url=/login.html'>";
	exit;
}
//if($_SERVER['PHP_SELF'] != "/main.html"){
//	$wrapper_class1 = " class='on'";
//	$wrapper_class2 = null;
//}else{
//	$wrapper_class1 = null;
//	$wrapper_class2 = " class='on'";
//}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="/img/favicon.png">

    <title>NDE</title>

    <!-- Bootstrap CSS -->    
    <link href="/css/bootstrap.min.css" rel="stylesheet">
    <!-- bootstrap theme -->
    <link href="/css/bootstrap-theme.css" rel="stylesheet">
    <!--external css-->
    <!-- font icon -->
    <link href="/css/elegant-icons-style.css" rel="stylesheet" />
    <link href="/css/font-awesome.min.css" rel="stylesheet" />    
    <!-- full calendar css-->
    <link href="/assets/fullcalendar/fullcalendar/bootstrap-fullcalendar.css" rel="stylesheet" />
	<link href="/assets/fullcalendar/fullcalendar/fullcalendar.css" rel="stylesheet" />
    <!-- easy pie chart-->
    <link href="/assets/jquery-easy-pie-chart/jquery.easy-pie-chart.css" rel="stylesheet" type="text/css" media="screen"/>
    <!-- owl carousel -->
    <link rel="stylesheet" href="/css/owl.carousel.css" type="text/css">
	<!--<link href="/css/jquery-jvectormap-1.2.2.css" rel="stylesheet">-->
      <link href="/css/jquery-jvectormap-2.0.3.css" rel="stylesheet">
    <!-- Custom styles -->
	<link rel="stylesheet" href="/css/fullcalendar.css">
	<link href="/css/widgets.css" rel="stylesheet">
    <link href="/css/style.css" rel="stylesheet">
    <link href="/css/style-responsive.css" rel="stylesheet" />
	<link href="/css/xcharts.min.css" rel=" stylesheet">	
	<link href="/css/jquery-ui-1.10.4.min.css" rel="stylesheet">
    <!-- =======================================================
        Theme Name: NiceAdmin
        Theme URL: https://bootstrapmade.com/nice-admin-bootstrap-admin-html-template/
        Author: BootstrapMade
        Author URL: https://bootstrapmade.com
    ======================================================= -->
  </head>
  <body>

  <!-- container section start -->
  <section id="container" class="">
     
      
      <header class="header dark-bg">
            <div class="toggle-nav">
                <div class="icon-reorder tooltips" data-original-title="Toggle Navigation" data-placement="bottom"><i class="icon_menu"></i></div>
            </div>
            <!--logo start-->
            <a href="/" class="logo">BAE <span class="lite">Admin</span></a> 
            <!--logo end-->
            <div class="top-nav notification-row">                
                <!-- notificatoin dropdown start-->
                <ul class="nav pull-right top-menu">
                    <!-- user login dropdown start-->
                    <li class="dropdown">
                        <a data-toggle="dropdown" class="dropdown-toggle" href="#">
                            <span class="profile-ava">
                                <img alt="" src="/img/avatar1_small.jpg">
                            </span>
                            <span class="username"><?=$_SESSION['user_name']?></span>
                            <b class="caret"></b>
                        </a>
                        <ul class="dropdown-menu extended logout">
                            <div class="log-arrow-up"></div>
                            <!--<li class="eborder-top">
                                <a href="#"><i class="icon_profile"></i> My Profile</a>
                            </li>
                            <li>
                                <a href="#"><i class="icon_mail_alt"></i> My Inbox</a>
                            </li>
                            <li>
                                <a href="#"><i class="icon_clock_alt"></i> Timeline</a>
                            </li>
                            <li>
                                <a href="#"><i class="icon_chat_alt"></i> Chats</a>
                            </li>-->
                            <li>
                                <a href="/logout.php"><i class="icon_key_alt"></i> Log Out</a>
                            </li>
                            <!--<li>
                                <a href="/documentation.html"><i class="icon_key_alt"></i> Documentation</a>
                            </li>
                            <li>
                                <a href="/documentation.html"><i class="icon_key_alt"></i> Documentation</a>
                            </li>-->
                        </ul>
                    </li>
                    <!-- user login dropdown end -->
                </ul>
                <!-- notificatoin dropdown end-->
            </div>
      </header>      
      <!--header end-->

      <!--sidebar start-->
      <aside>
          <div id="sidebar"  class="nav-collapse ">
              <!-- sidebar menu start-->
              <ul class="sidebar-menu">                
                  <li class="active">
                      <a class="" href="/">
                          <i class="icon_house_alt"></i>
                          <span>Dashboard</span>
                      </a>
                  </li>
                  <li class="sub-menu">
                      <a href="javascript:;" class="">
                          <i class="icon_document_alt"></i>
                          <span>회원관리</span>
                          <span class="menu-arrow arrow_carrot-right"></span>
                      </a>
                      <ul class="sub">
                          <li><a class="" href="/users/userList.html">회원목록</a></li>
                          <li><a class="" href="/users/userList_sp.html">회원목록(S)</a></li>
                      </ul>
                  </li>
                  <li class="sub-menu">
                      <a href="javascript:;" class="">
                          <i class="icon_document_alt"></i>
                          <span>상점관리</span>
                          <span class="menu-arrow arrow_carrot-right"></span>
                      </a>
                      <ul class="sub">
						  <li><a class="" href="/shop/ndeList.html">EBS 결제목록</a></li>
                          <li><a class="" href="/shop/giftDoc.html">상품목록(xml)</a></li>
                          <li><a class="" href="/shop/questDoc.html">퀘스트목록(xml)</a></li>
                      </ul>
                  </li>
                  <li>
                      <a class="" href="/log/extList.html">
                          <i class="icon_genius"></i>
                          <span>로그조회</span>
                      </a>
                  </li>
				  <li>
                      <a class="" href="/log/popList.html" target="ndeTest">
                          <i class="icon_genius"></i>
                          <span>NDE 학습테스트</span>
                      </a>
                  </li>
                  <li class="sub-menu">
                      <a href="javascript:;" class="">
                          <i class="icon_desktop"></i>
                          <span>UI Fitures</span>
                          <span class="menu-arrow arrow_carrot-right"></span>
                      </a>
                      <ul class="sub">
                          <li><a class="" href="/general.html">Elements</a></li>
                          <li><a class="" href="/buttons.html">Buttons</a></li>
                          <li><a class="" href="/grids.html">Grids</a></li>
                      </ul>
                  </li>
                  <li>
                      <a class="" href="widgets.html">
                          <i class="icon_genius"></i>
                          <span>Widgets</span>
                      </a>
                  </li>
                  <li>                     
                      <a class="" href="chart-chartjs.html">
                          <i class="icon_piechart"></i>
                          <span>Charts</span>
                      </a>
                  </li>
                             
                  <li class="sub-menu">
                      <a href="javascript:;" class="">
                          <i class="icon_table"></i>
                          <span>Tables</span>
                          <span class="menu-arrow arrow_carrot-right"></span>
                      </a>
                      <ul class="sub">
                          <li><a class="" href="/basic_table.html">Basic Table</a></li>
                      </ul>
                  </li>
                  
                  <li class="sub-menu">
                      <a href="javascript:;" class="">
                          <i class="icon_documents_alt"></i>
                          <span>Pages</span>
                          <span class="menu-arrow arrow_carrot-right"></span>
                      </a>
                      <ul class="sub">                          
                          <li><a class="" href="/profile.html">Profile</a></li>
                          <li><a class="" href="/login.html"><span>Login Page</span></a></li>
                          <li><a class="" href="/blank.html">Blank Page</a></li>
                          <li><a class="" href="/404.html">404 Error</a></li>
                      </ul>
                  </li>
                  
                  <script>
                      var srv_time = "<?=date("F d, Y H:i: s", time()); ?>";
                      var now = new Date(srv_time);
                      setInterval("display_time()", 1000);

                      function display_time() {
                          now.setSeconds(now.getSeconds() + 1);
                          var st = "<?=date('T') ?> " +
                              ("0" + now.getHours()).slice(-2) + ':' +
                              ("0" + now.getMinutes()).slice(-2) + ':' +
                              ("0" + now.getSeconds()).slice(-2) + ' ' +
                              ("0" + now.getDate()).slice(-2) + '/' +
                              ("0" + (now.getMonth() + 1)).slice(-2) + '/' +
                              now.getFullYear();

                          document.getElementById("server_time").innerHTML = st;

                          var hrs = -(new Date().getTimezoneOffset() / 60)
                          var d = new Date();
                          var s =
                              ("0" + d.getHours()).slice(-2) + ':' +
                              ("0" + d.getMinutes()).slice(-2) + ':' +
                              ("0" + d.getSeconds()).slice(-2) + ' ' +
                              ("0" + d.getDate()).slice(-2) + '/' +
                              ("0" + (d.getMonth() + 1)).slice(-2) + '/' +
                              d.getFullYear() + ' ' +
                              'GMT+' + hrs

                          document.getElementById("local_time").innerHTML = s;
                      }
                  </script>
                  <li>
                      <a class="" href="javascript:;">
                          Server
                          <span id="server_time"></span>
                          Client
                          <span id="local_time"></span>
                      </a>
                  </li>
              </ul>
              <!-- sidebar menu end-->
          </div>
      </aside>
      <!--sidebar end-->
      
      <!--main content start-->


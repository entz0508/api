<? 
function get_dirname($i) {
	 $relative_path = preg_replace("`\/[^/]*\.php$`i", "/", $_SERVER['PHP_SELF']);
	 $dir = $relative_path;
	 $temp = explode("/", $dir);
	 if(sizeof($temp) > 2){
		$dirname = $temp[$i-1];
	 }else{
		$dirname = "";
	 }
	 return $dirname;
}
$path1 = get_dirname(3);
$path2 = get_dirname(4);
?>
<ul class="sidebar-menu" data-widget="tree">
        <li class="header">MAIN NAVIGATION
		</li>
          <li class="treeview <?=($path1 == "account")?"active":"" ?>">
              <a href="#">
                  <i class="fa fa-user"></i> <span>회원관리</span>
                  <span class="pull-right-container">
                      <i class="fa fa-angle-left pull-right"></i>
                  </span>
              </a>
              <ul class="treeview-menu">
                  <li <?=($path2 == "users.html")?"class=\"active\"":"" ?>><a href="/pages/account/users.html"><i class="fa fa-circle-o"></i> 회원검색</a></li>
				  <li <?=($path2 == "usersDrop.html")?"class=\"active\"":"" ?>><a href="/pages/account/usersDrop.html"><i class="fa fa-circle-o"></i> 탈퇴회원조회</a></li>
              </ul>
          </li>

          <li class="treeview <?=($path1 == "channel")?"active":"" ?>">
              <a href="#">
                  <i class="fa fa-newspaper-o"></i> <span>채널관리</span>
                  <span class="pull-right-container">
                      <i class="fa fa-angle-left pull-right"></i>
                  </span>
              </a>
              <ul class="treeview-menu">
                  <li <?=($path2 == "banners.html")?"class=\"active\"":"" ?>><a href="/pages/channel/banners.html"><i class="fa fa-circle-o"></i> 배너관리</a></li>
                  <li <?=($path2 == "todays.html")?"class=\"active\"":"" ?>><a href="/pages/channel/todays.html"><i class="fa fa-circle-o"></i> 오늘의말씀 관리</a></li>
              </ul>
          </li>

		  <li class="treeview <?=($path1 == "userlog")?"active":"" ?>">
              <a href="#">
                  <i class="fa fa-bell-o"></i> <span>로그조회</span>
                  <span class="pull-right-container">
                      <i class="fa fa-angle-left pull-right"></i>
                  </span>
              </a>
              <ul class="treeview-menu">
                  <li <?=($path2 == "community.html")?"class=\"active\"":"" ?>><a href="/pages/userlog/community.html"><i class="fa fa-circle-o"></i> 커뮤니티</a></li>
				  <li <?=($path2 == "highlight.html")?"class=\"active\"":"" ?>><a href="/pages/userlog/highlight.html"><i class="fa fa-circle-o"></i> 하이라이트</a></li>
				  <li <?=($path2 == "bookmark.html")?"class=\"active\"":"" ?>><a href="/pages/userlog/bookmark.html"><i class="fa fa-circle-o"></i> 북마크</a></li>
				  <li <?=($path2 == "note.html")?"class=\"active\"":"" ?>><a href="/pages/userlog/note.html"><i class="fa fa-circle-o"></i> 노트</a></li>
				  <li <?=($path2 == "audioLog.html")?"class=\"active\"":"" ?>><a href="/pages/userlog/audioLog.html"><i class="fa fa-circle-o"></i> 듣기로그</a></li>
              </ul>
          </li>
      </ul>
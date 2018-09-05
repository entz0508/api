  </section>
  <!-- container section start -->

    <!-- javascripts -->
    <script src="/js/jquery.js"></script>
	<script src="/js/jquery-ui-1.10.4.min.js"></script>
    <script src="/js/jquery-1.8.3.min.js"></script>
    <script type="text/javascript" src="/js/jquery-ui-1.9.2.custom.min.js"></script>
    <!-- bootstrap -->
    <script src="/js/bootstrap.min.js"></script>
    <!-- nice scroll -->
    <script src="/js/jquery.scrollTo.min.js"></script>
    <script src="/js/jquery.nicescroll.js" type="text/javascript"></script>
    <!-- charts scripts -->
    <script src="/assets/jquery-knob/js/jquery.knob.js"></script>
    <script src="/js/jquery.sparkline.js" type="text/javascript"></script>
    <script src="/assets/jquery-easy-pie-chart/jquery.easy-pie-chart.js"></script>
    <script src="/js/owl.carousel.js" ></script>
    <!-- jQuery full calendar -->
    <<script src="/js/fullcalendar.min.js"></script> <!-- Full Google Calendar - Calendar -->
	<script src="/assets/fullcalendar/fullcalendar/fullcalendar.js"></script>
    <!--script for this page only-->
    <script src="/js/calendar-custom.js"></script>
	<script src="/js/jquery.rateit.min.js"></script>
    <!-- custom select -->
    <script src="/js/jquery.customSelect.min.js" ></script>
	<script src="/assets/chart-master/Chart.js"></script>
    <!--custome script for all page-->
    <script src="/js/scripts.js"></script>
    <!-- custom script for this page-->
    <script src="/js/sparkline-chart.js"></script>
    <script src="/js/easy-pie-chart.js"></script>
	<!--<script src="/js/jquery-jvectormap-1.2.2.min.js"></script>-->
      <script src="/js/jquery-jvectormap-2.0.3.min.js"></script>
	<script src="/js/jquery-jvectormap-world-mill-kr.js"></script>
	<script src="/js/xcharts.min.js"></script>
	<script src="/js/jquery.autosize.min.js"></script>
	<script src="/js/jquery.placeholder.min.js"></script>
	<script src="/js/gdp-data.js?v=3"></script>	
	<script src="/js/morris.min.js"></script>
	<script src="/js/sparklines.js"></script>	
	<script src="/js/charts.js?v=<?=time()?>"></script>
	<script src="/js/jquery.slimscroll.min.js"></script>
      <script>
        <?
        $sql = "select DATE_FORMAT(REG_DATETIME, '%Y-%m-%d') as REG_DATETIME,count(*) as cnt 
                                from slp_account_db.account_tb 
                                where REG_DATETIME > date_add(now(), interval -15 day) 
                                group by DATE_FORMAT(REG_DATETIME, '%Y-%m-%d')
                                order by REG_DATETIME asc;";
        $result = $db ->query($sql);
        $gd = "";
                while ($row = $result ->fetch_assoc()) {
            $gd .= $row['cnt'].",";
        }
        //$gd = substr($gd, 0, strlen($gd) - 1);
        ?>      
            $("#todayspark1").sparkline([<?=$gd?>], {
                        type: 'bar',
                        height: '30',
                        barWidth: 12,
                        barColor: '#999'
            });

        <?
        $sql = "select  DATE_FORMAT(REG_DATETIME, '%X %V') as week,count(*) as cnt
                    from slp_account_db.account_tb a 
                     where REG_DATETIME > date(DATE_SUB(now(), INTERVAL 6 month))
                    group by  DATE_FORMAT(REG_DATETIME, '%X %V');";
        $result = $db ->query($sql);
        $gd = "";
        while ($row = $result ->fetch_assoc()) {
            $gd .= $row['cnt'].",";
        }
        //$gd = substr($gd, 0, strlen($gd) - 1);
        ?>      

            $("#todayspark5").sparkline([<?=$gd?>], {
                        type: 'line',
                        width: '250',
                        height: '50',
                        lineColor: '#436B91',
                        fillColor: '#FF0000'
             });
    </script>
    <script>

      //knob
      $(function() {
        $(".knob").knob({
          'draw' : function () { 
            $(this.i).val(this.cv + '%')
          }
        })
      });

      //carousel
      $(document).ready(function() {
          $("#owl-slider").owlCarousel({
                      navigation : true,
                      slideSpeed : 300,
                      paginationSpeed : 400,
                      singleItem : true
          });
      });

      //custom select box

      $(function(){
          $('select.styled').customSelect();
      });

      function comma(str) {
          str = String(str);
          return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
      }
	  /* ---------- Map ---------- */
        <?
        $sql = 'select N.COUNTRY_name,iso_cd,IFNULL(A.cnt,0) as cnt from slp_platform_db.country_tb N left join (select COUNTRY,count(*) as cnt from slp_account_db.account_tb  where REG_DATETIME >= date_add(now(), interval -24 hour) group by COUNTRY) A on N.iso_cd = A.COUNTRY';
        $result = $db ->query($sql);
        $gd = "";
        while ($row = $result ->fetch_assoc()) {
            $gd.= "\"".$row['iso_cd']."\":".$row['cnt'].",";
        }
        $gd = substr($gd, 0, strlen($gd) - 1);
        ?>
      $(function () {
          gdpData = {<?=$gd ?>};
	      $('#map').vectorMap({
	        map: 'world_mill_kr',
	        series: {
	          regions: [{
	            values: gdpData,
                scale: ['#C8EEFF', '#0071A4'],
	            normalizeFunction: 'polynomial'
	          }]
            },
            backgroundColor: '#eef3f7',
            onRegionTipShow: function (e, el, code) {
                //console.log(el.html());
                el.html(el.html() + ' (Account - ' +comma(gdpData[code])+')');
	        }
	      });
	    });

  </script>

          

  </body>
</html>
CREATE DEFINER=`root`@`localhost` PROCEDURE `spOpenRefundPermition`(stepAttendID bigint, refundID varchar(50), refundStatCD varchar(50), refundRsnCD varchar(50), refundTime varchar(60), refundAmt bigint, bluearkUid varchar(60))
BEGIN

    declare existStepAttendID bigint;
    declare existAccountID bigint;
    declare tmpAttendStatCD varchar(20);
    declare checkSeqID bigint;
    declare existRefundID varchar(50);
    declare tmpStepAttendID bigint;
    declare tmpRefundID varchar(50);
    declare resCode int;

	set existStepAttendID = 0;
    set resCode = -1;
    set checkSeqID = slp_nde_db.fnCheckSeqID(stepAttendID);

    select bit.step_attend_id, bit.account_id, bit.ATTEND_STAT_CD
	into existStepAttendID, existAccountID, tmpAttendStatCD
	from slp_nde_db.buy_info_tb as bit
	left join slp_account_db.ext_user_token_tb as ett
		on bit.account_id = ett.account_id
	where bit.step_attend_id = stepAttendID and ett.token = bluearkUid; -- buy info tb 에 stepattend id 값 가지고 옴


    select step_attend_id, refund_id
    into tmpStepAttendID, tmpRefundID
    from slp_nde_db.refund_tb
    where step_attend_id = stepAttendID;
	-- 최초 환불 신청시 CN1ST1 or CN1ST2 로 refundStatCD 받음

	if(refundStatCD != 'CN1ST4' and refundStatCD is not null) then

        if(stepAttendID = existStepAttendID and tmpRefundID is not null)then -- 기존에 환불 처리 한 내역이 존재(update 만)

			update slp_nde_db.refund_tb set refund_stat_cd = refundStatCD and refund_rsn_cd = refundRsnCD
			where step_attend_id = stepAttendID and refund_id = refundID;

        else
		#elseif(stepAttendID != existStepAttendID) then -- 새로운 환불 데이터 생성 insert

			-- episode_perm_tb 에 업데이트
			update slp_nde_db.nde_episode_perm_tb set EXPIRED = 'Y', EXPIRED_DATE = DATE_FORMAT(now(), '%Y-%m-%d %H:%i:%s') where seq_id = checkSeqID;

            -- refund_tb 에 저장
			insert slp_nde_db.refund_tb (step_attend_id, refund_stat_cd, refund_rsn_cd, refund_id, refund_time, refund_amt)
            values (stepAttendID, refundStatCD, refundRsnCD, refundID, DATE_FORMAT(now(), '%Y-%m-%d %H:%i:%s'), refundAmt);

				if(tmpAttendStatCD = 'L15SH1')then

					if(refundStatCD = 'CN1ST1')then
						update slp_nde_db.buy_info_tb
						set EXPIRED = 'Y', EXPIRED_DATE = DATE_FORMAT(now(), '%Y-%m-%d %H:%i:%s'),
							REFUND_RSN_CODE = refundRsnCD, REFUND_STATUS_CODE = refundStatCD, REFUND_AMT = refundAmt, attend_stat_cd = 'L15SH7'
						where step_attend_id = stepAttendID and seq_id = checkSeqID and attend_stat_cd = 'L15SH1';
					elseif(refundStatCD = 'CN1ST3')then
						update slp_nde_db.buy_info_tb
						set EXPIRED = 'Y', EXPIRED_DATE = DATE_FORMAT(now(), '%Y-%m-%d %H:%i:%s'),
							REFUND_RSN_CODE = refundRsnCD, REFUND_STATUS_CODE = refundStatCD, REFUND_AMT = refundAmt, attend_stat_cd = 'L15SH5'
						where step_attend_id = stepAttendID and seq_id = checkSeqID and attend_stat_cd = 'L15SH1';

					end if;

				set resCode = 0;
				#select resCode as `RES`; -- 대기중에 환불 취소 건

				elseif(tmpAttendStatCD = 'L15SH2')then

					if(refundStatCD = 'CN1ST2')then
						update slp_nde_db.buy_info_tb
						set EXPIRED = 'Y', EXPIRED_DATE = DATE_FORMAT(now(), '%Y-%m-%d %H:%i:%s'),
							REFUND_RSN_CODE = refundRsnCD, REFUND_STATUS_CODE = refundStatCD, REFUND_AMT = refundAmt, attend_stat_cd = 'L15SH8'
						where step_attend_id = stepAttendID and seq_id = checkSeqID and attend_stat_cd = 'L15SH2';
					elseif(refundStatCD = 'CN1ST3')then
						update slp_nde_db.buy_info_tb
						set EXPIRED = 'Y', EXPIRED_DATE = DATE_FORMAT(now(), '%Y-%m-%d %H:%i:%s'),
							REFUND_RSN_CODE = refundRsnCD, REFUND_STATUS_CODE = refundStatCD, REFUND_AMT = refundAmt, attend_stat_cd = 'L15SH6'
						where step_attend_id = stepAttendID and seq_id = checkSeqID and attend_stat_cd = 'L15SH2';

					end if;

				set resCode = 0;
				#select resCode as `RES`; -- 학습중에 환불 취소 건

				elseif(tmpAttendStatCD = 'L15SH5' or tmpAttendStatCD = 'L15SH6') then
					set resCode = 0;
				#	select resCode as `RES`;

				else
					set resCode = -1;
					select resCode as `RES`, 'attend_stat_cd isn''t correct' as `MSG`;
				end if;

			set resCode = 0;
			select resCode as `RES`;

        /*
		else
			set resCode = -1;
            select resCode as `RES`, 'incorrect stepAttendID' as `MSG`;
		*/
		end if;

	elseif(refundStatCD = 'CN1ST4') then -- 환불 취소 일 때

		if(tmpAttendStatCD = 'L15SH1' or tmpAttendStatCD = 'L15SH5')then
			update slp_nde_db.buy_info_tb set attend_stat_cd = 'L15SH1', EXPIRED = 'N', REFUND_STATUS_CODE = refundStatCD
			where step_attend_id = stepAttendID and BEGIN_DATETIME is null and END_DATETIME is null;

        elseif(tmpAttendStatCD = 'L15SH2' or tmpAttendStatCD = 'L15SH6')then

			update slp_nde_db.buy_info_tb set attend_stat_cd = 'L15SH2', EXPIRED = 'N', REFUND_STATUS_CODE = refundStatCD
			where step_attend_id = stepAttendID and BEGIN_DATETIME is not null and END_DATETIME is not null and END_DATETIME > DATE_FORMAT(now(), '%Y-%m-%d %H:%i:%s');
		end if;

        update slp_nde_db.nde_episode_perm_tb set EXPIRED = 'N', EXPIRED_DATE = DATE_FORMAT(now(), '%Y-%m-%d %H:%i:%s') where seq_id = checkSeqID;
        update slp_nde_db.refund_tb set refund_stat_cd = refundStatCD where step_attend_id = stepAttendID;

		set resCode = 0;
		select resCode as `RES`; 	-- buy_info_tb 에 step_attend_id 존재

    else
		set resCode = -1;
		select resCode as `RES`, 'incorrect refund_stat_cd' as `MSG`;

	end if;


END
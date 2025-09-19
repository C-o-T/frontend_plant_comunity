export const handleErrorMsg = (e, joinData) => {
  //아이디-유효성검사
  //영어소문자, 숫자 조합만 가능 + 4~10자
  const memIdRegex = /^[a-z0-9]{4,10}$/;


  //비밀번호-유효성검사
  //영어 대소문자 + 숫자, 4~12자
  const memPwRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,12}$/;

  //이름
  //필수입력

  //전화번호-유효성검사
  //000-0000-0000 형식
  const memTellRegex = /^\d{3}-\d{4}-\d{4}$/;

  //사업자등록번호-유효성검사
  //000-00-00000 형식
  const memBusinessNumRegex = /^\d{3}-\d{2}-\d{5}$/;

  //상호명
  //사업자등록번호를 입력했다면, 입력하기

  //유효성검사
  let errorStr = '';
  switch(e.target.name){
    case 'memId' :
      if(!e.target.value){
        errorStr = '아이디를 입력하세요.'
      } else if (e.target.value.length < 4 || e.target.value.length > 11) {
        errorStr = '아이디는 4~10글자여야합니다.'
      } else if (!memIdRegex.test(e.target.value)) {
        errorStr = '아이디는 영어 소문자, 숫자만 사용할 수 있습니다.'
      } else {
        errorStr = ''
      }
      break;

    case 'memPw' :
      if (!e.target.value) {
        errorStr = '비밀번호를 입력하세요.'
      } else if (e.target.value.length < 4 || e.target.value.length > 13) {
        errorStr = '비밀번호는 4~12글자여야 합니다.'
      } else if (!memPwRegex.test(e.target.value)) {
        errorStr = '비밀번호는 영어와 숫자를 합께 사용해야합니다.'
      } else {
        errorStr = ''
      }
      break;

    case 'memPwConfirm' :
      if (joinData.memPw !== e.target.value) {
        errorStr = '비밀번호가 일치하지 않습니다.'
      } else {
        errorStr = ''
      }
      break;

    case 'memName' :
      if (!e.target.value) {
        errorStr = '이름을 입력하세요.'
      } else {
        errorStr = ''
      }
      break;

    case 'memTell' :
      if (!e.target.value) {
        errorStr = '연락처를 입력하세요.'
      } else if (!memTellRegex.test(e.target.value)) {
        errorStr = '000-0000-0000 형식으로 입력하세요.'
      } else {
        errorStr = ''
      }
      break;

    case 'memBusinessNum' :
      if (!e.target.value) {
        errorStr = '사업자번호를 입력하세요'
      } else if (!memBusinessNumRegex.test(e.target.value)) {
        errorStr = '000-00-00000 형식으로 입력하세요.'
      } else {
        errorStr = ''
      }
      if (joinData.memBusinessName !=='' && e.target.value === '') {
        errorStr = '사업자번호를 입력하세요.'
      }
      break;

    case 'memBusinessName' :
      if (!e.target.value) {
        errorStr = ''
      }
      if (joinData.memBusinessNum !== '' && e.target.value === '') {
        errorStr = '상호명을 입력하세요.'
      }
      break;
    
  }
  
  return errorStr;
}
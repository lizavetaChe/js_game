function login(){
    let input = document.getElementById("nickname");
    if (input.value==='')
        return;
    fetch(
        '/login',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({nickname: input.value})
        }
    )
        .then((res)=>{
            window.location.href='/history';
        })
}
import logo from '@/statics/images/logo.svg';
import '@/statics/css/index.less';
import { Button } from 'antd';
import { getImgCode64, LOGINSECRET } from '@/common/api/login';
import { useEffect } from 'react';

function App() {
    // 调试接口
    useEffect(() => {
        const sendData = {
            "height": 40,
            "key": LOGINSECRET.key,
            "lineSize": 0,
            "stringNum": 4,
            "width": 100
        };
        getImgCode64(sendData).then((res) => {
            if (res && res.code === 200) {
                console.log(res);
            }
        });
    }, []);
    return <div className="App">
        <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
                Edit <code>src/App.js</code> and save to reload.
            </p>
            <a className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer">
                Learn React</a>
            <Button type="primary">Button</Button>
        </header>
    </div>;
}

export default App;

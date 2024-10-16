// Hàm gọi API sử dụng phương thức GET

const BASE_URL_BACKEND = 'http://150.95.110.131:8084'

// export const accessToken = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzeXNhZG1pbiIsImF1dGgiOiJBRE1JTl9BQ1RJT05fU0VBUkNILEFETUlOX01PRFVMRV9VUERBVEUsQURNSU5fTU9EVUxFX0lOU0VSVCxBRE1JTl9NT0RVTEVfU0VBUkNILEFETUlOX01PRFVMRV9ERUxFVEUsQURNSU5fVVNFUl9VUERBVEUsQURNSU5fVVNFUl9JTlNFUlQsQURNSU5fVVNFUl9TRUFSQ0gsQURNSU5fVVNFUl9ERUxFVEUsQURNSU5fUk9MRV9VUERBVEUsQURNSU5fUk9MRV9JTlNFUlQsQURNSU5fUk9MRV9TRUFSQ0gsQURNSU5fUk9MRV9ERUxFVEUsQURNSU5fVVNFUl9WSUVXLEFETUlOX1JPTEVfVklFVyxBRE1JTl9BQ1RJT05fVVBEQVRFLEFETUlOX0FDVElPTl9JTlNFUlQsQWdlbnRzX1VQREFURSxBZ2VudHNfSU5TRVJULEFnZW50c19TRUFSQ0gsQWdlbnRzX1ZJRVcsQWdlbnRzX0RFTEVURSxEZXZpY2VNYW5hZ2VfVVBEQVRFLERldmljZU1hbmFnZV9JTlNFUlQsRGV2aWNlTWFuYWdlX1NFQVJDSCxEZXZpY2VNYW5hZ2VfVklFVyxEZXZpY2VNYW5hZ2VfREVMRVRFLEN1c3RvbWVyTWFuYWdlbWVudF9VUERBVEUsQ3VzdG9tZXJNYW5hZ2VtZW50X0lOU0VSVCxDdXN0b21lck1hbmFnZW1lbnRfU0VBUkNILEN1c3RvbWVyTWFuYWdlbWVudF9WSUVXLEN1c3RvbWVyTWFuYWdlbWVudF9ERUxFVEUsU3RhdGlzdGljQ3VzdG9tZXJfU0VBUkNIIiwiZXhwIjoxNzI5MDk5OTA1fQ.6QDNjDdFJZUIi95n4_UB5HpaqDdkx675tKDfPmNicGHyJrkdjPRiANAAB8FMlqrkQKUmQpd4GPDMbeX1sybQPw';
export const accessToken ='';

export async function getDataBackend(url, accessToken) {
    try {
        const response = await fetch(`https://gsgt-haiphong.vtscloud.vn:9090/v1.0/id/api/pass-config`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            throw new Error('Không thể lấy dữ liệu từ API');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi gọi API:' + error + 'url: ' + url);
        return null;
    }
}

export async function deleteDataBackend(url, accessToken) {
    try {
        const response = await fetch(BASE_URL_BACKEND + url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            throw new Error('Không thể xóa dữ liệu từ API');
        }
    } catch (error) {
        console.error('Lỗi khi gọi API:' + error + 'url: ' + url);
        return null;
    }
}

// Hàm gọi API sử dụng phương thức POST
export async function postDataBackend(url, body, accessToken) {
    try {
        const response = await fetch(BASE_URL_BACKEND + url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            throw new Error('Không thể gửi dữ liệu đến API');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi gọi API:' + error + 'url: ' + BASE_URL_BACKEND + url);
        return null;
    }
}

// Hàm gọi API sử dụng phương thức PUT
export async function putDataBackend(url, body, accessToken) {
    try {
        const response = await fetch(BASE_URL_BACKEND + url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            throw new Error('Không thể cập nhật dữ liệu thông qua API');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi gọi API:' + error + 'url: ' + url);
        return null;
    }
}

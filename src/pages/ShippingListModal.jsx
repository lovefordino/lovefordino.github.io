// src/components/ShippingListModal.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import './css/ShippingFormModal.css'; // 같은 스타일 재사용
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function ShippingListModal({ isOpen, onClose }) {
  const [shippingData, setShippingData] = useState([]);
  const exportToExcel = (data) => {
    if (!data || data.length === 0) return;

    const worksheetData = data.map((entry) => ({
      이름: entry.name,
      연락처: entry.phone,
      주소: entry.address || '',
      '상품 목록': entry.prizes
        .map((p) => `${p.rank}등 - ${p.name} (${p.count}개)`)
        .join(', '),
      제출일: new Date(entry.createdAt.seconds * 1000).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '배송정보');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, '배송정보.xlsx');
  };

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'shippingInfo'));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setShippingData(data);
    };

    fetchData();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="shipping-modal-overlay">
      <div className="shipping-modal list">
        <div class="admin-header">
          <h1>배송 정보 목록 <span>※ 개인정보 보호를 위해 배송이 완료된 후, 수집된 이름·연락처·주소 정보는 반드시 삭제해 주세요.</span></h1>
          <div class="admin-status">
            <button
              className="btn-mint"
              style={{ marginRight: 10 }}
              onClick={() => exportToExcel(shippingData)}
            >
              배송 정보 엑셀 다운로드
            </button>
            <button className="btn-red" onClick={onClose}>닫기</button>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>이름</th>
                <th>연락처</th>
                <th>주소</th>
                <th>상품 목록</th>
                <th>제출일</th>
              </tr>
            </thead>
            <tbody>
              {shippingData.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.name}</td>
                  <td>{entry.phone}</td>
                  <td>{entry.address}</td>
                  <td>
                    <ul>
                      {entry.prizes.map((p, i) => (
                        <li key={i}>
                          {p.rank}등 - {p.name} ({p.count}개)
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>{new Date(entry.createdAt.seconds * 1000).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ShippingListModal;

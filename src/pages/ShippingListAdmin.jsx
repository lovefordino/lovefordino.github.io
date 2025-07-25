// src/pages/ShippingListAdmin.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './css/draw.css'

function ShippingListAdmin() {
  const [shippingData, setShippingData] = useState([]);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      alert('접근 권한이 없습니다.');
      navigate('/admin-login');
      return;
    }

    const fetchShippingData = async () => {
      const snapshot = await getDocs(collection(db, 'shippingInfo'));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setShippingData(data);
    };

    fetchShippingData();
  }, [isAdmin, navigate]);

  const deleteAllShippingInfo = async () => {
    const snapshot = await getDocs(collection(db, 'shippingInfo'));
    const deletePromises = snapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, 'shippingInfo', docSnap.id))
    );
    await Promise.all(deletePromises);
  };

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

  return (
    <div className="shipping-list-admin">
      <div className="shipping-btn-wrapper">
        <button
          className="btn-mint"
          style={{ marginBottom: 20, marginRight: 10 }}
          onClick={() => exportToExcel(shippingData)}
        >
          배송 정보 엑셀 다운로드
        </button>
        <button
          className="btn-red"
          style={{ marginBottom: 20 }}
          onClick={async () => {
            const result = await Swal.fire({
              title: '정말 모든 배송 정보를 삭제하시겠습니까?',
              text: '삭제된 정보는 복구할 수 없습니다.',
              showCancelButton: true,
              confirmButtonColor: '#e74c3c',
              cancelButtonColor: '#ccc',
              confirmButtonText: '삭제',
              cancelButtonText: '취소',
            });

            if (!result.isConfirmed) return;

            try {
              await deleteAllShippingInfo();
              await Swal.fire({
                title: '삭제 완료!',
                confirmButtonColor: '#85d8ea',
              });
              window.location.reload(); // 데이터 새로고침
            } catch (err) {
              console.error(err);
              await Swal.fire({
                title: '삭제 실패',
                text: '잠시 후 다시 시도해주세요.',
                confirmButtonColor: '#85d8ea',
              });
            }
          }}
        >
          배송 정보 전체 삭제
        </button>
      </div>
      <table border="1" cellPadding="8">
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
  );
}

export default ShippingListAdmin;

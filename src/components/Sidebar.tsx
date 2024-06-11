import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './Sidebar.module.css';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../store';
import { FiLogOut, FiHome, FiUsers, FiMap, FiUser, FiDollarSign, FiCalendar, FiSettings } from 'react-icons/fi';
import React, { useEffect } from 'react';

export default function Sidebar() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logoutUser() as any);
  };

  useEffect(() => {
    const gajkesariText = document.querySelector(`.${styles.brand}`);
    if (gajkesariText) {
      gajkesariText.classList.add(styles.animateText);
    }
  }, []);

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.brand}>Gajkesari</h2>
      </div>
      <ul className={styles.sidebarList}>
        <li className={styles.sidebarItem}>
          <Link href="/Dashboard?reset=true" shallow={true} legacyBehavior>
            <a className={`${styles.sidebarLink} ${router.pathname === '/Dashboard' ? styles.active : ''}`}>
              <FiHome className={styles.sidebarIcon} />
              <span>Dashboard</span>
            </a>
          </Link>
        </li>
        <li className={styles.sidebarItem}>
          <Link href="/CustomerListPage" legacyBehavior>
            <a className={`${styles.sidebarLink} ${router.pathname === '/CustomerListPage' ? styles.active : ''}`}>
              <FiUsers className={styles.sidebarIcon} />
              <span>Customers List</span>
            </a>
          </Link>
        </li>
        <li className={styles.sidebarItem}>
          <Link href="/VisitsList" legacyBehavior>
            <a className={`${styles.sidebarLink} ${router.pathname === '/VisitsList' ? styles.active : ''}`}>
              <FiMap className={styles.sidebarIcon} />
              <span>Visits List</span>
            </a>
          </Link>
        </li>
        <li className={styles.sidebarItem}>
          <Link href="/Employeelist" legacyBehavior>
            <a className={`${styles.sidebarLink} ${router.pathname === '/Employeelist' ? styles.active : ''}`}>
              <FiUser className={styles.sidebarIcon} />
              <span>Employee List</span>
            </a>
          </Link>
        </li>
        <li className={styles.sidebarItem}>
          <Link href="/Expense" legacyBehavior>
            <a className={`${styles.sidebarLink} ${router.pathname === '/Expense' ? styles.active : ''}`}>
              <FiDollarSign className={styles.sidebarIcon} />
              <span>Expense</span>
            </a>
          </Link>
        </li>
        <li className={styles.sidebarItem}>
          <Link href="/Attendance" legacyBehavior>
            <a className={`${styles.sidebarLink} ${router.pathname === '/Attendance' ? styles.active : ''}`}>
              <FiCalendar className={styles.sidebarIcon} />
              <span>Attendance</span>
            </a>
          </Link>
        </li>
        <li className={styles.sidebarItem}>
          <Link href="/Settings" legacyBehavior>
            <a className={`${styles.sidebarLink} ${router.pathname === '/Settings' ? styles.active : ''}`}>
              <FiSettings className={styles.sidebarIcon} />
              <span>Settings</span>
            </a>
          </Link>
        </li>
      </ul>
      <div className={styles.sidebarFooter}>
        <button className={styles.logoutButton} onClick={handleLogout}>
          <FiLogOut className={styles.sidebarIcon} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

import Link from 'next/link';
import styles from './Sidebar.module.css';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../store';
import { FiLogOut, FiSettings } from 'react-icons/fi';

export default function Sidebar() {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser() as any);
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <Link href="/Settings" className={styles.sidebarSettings}>
          <FiSettings className={styles.settingsIcon} />
          <span className={styles.settingsText}>Settings</span>
        </Link>
      </div>
      <ul className={styles.sidebarList}>
        {/* Existing sidebar items */}
        <li className={styles.sidebarItem}>
          <Link href="/Dashboard?reset=true" shallow={true} className={styles.sidebarLink}>
            Dashboard
          </Link>
        </li>
        <li className={styles.sidebarItem}>
          <Link href="/CustomerListPage" className={styles.sidebarLink}>
            Customers List
          </Link>
        </li>
        <li className={styles.sidebarItem}>
          <Link href="/VisitsList" className={styles.sidebarLink}>
            Visits List
          </Link>
        </li>
        <li className={styles.sidebarItem}>
          <Link href="/Employeelist" className={styles.sidebarLink}>
            Employee list
          </Link>
        </li>
        <li className={styles.sidebarItem}>
          <Link href="/Expense" className={styles.sidebarLink}>
            Expense
          </Link>
        </li>
        <li className={styles.sidebarItem}>
          <Link href="/Attendance" className={styles.sidebarLink}>
            Attendance
          </Link>
        </li>
      </ul>
      <div className={styles.sidebarFooter}>
        <button className={styles.sidebarLink} onClick={handleLogout}>
          <FiLogOut className={styles.sidebarIcon} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

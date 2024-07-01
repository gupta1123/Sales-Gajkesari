import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './Sidebar.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store';
import { FiLogOut, FiHome, FiUsers, FiMap, FiUser, FiClipboard, FiDollarSign, FiCalendar, FiSettings } from 'react-icons/fi';
import { RootState } from '../store';

export default function Sidebar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const role = useSelector((state: RootState) => state.auth.role);

  const handleLogout = () => {
    dispatch(logoutUser() as any);
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2>Gajkesari</h2>
      </div>
      <div className={styles.sidebarContent}>
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
            <Link href="/VisitsList" legacyBehavior>
              <a className={`${styles.sidebarLink} ${router.pathname === '/VisitsList' ? styles.active : ''}`}>
                <FiMap className={styles.sidebarIcon} />
                <span>Visits List</span>
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
          {role === 'ADMIN' && (
            <li className={styles.sidebarItem}>
              <Link href="/Attendance" legacyBehavior>
                <a className={`${styles.sidebarLink} ${router.pathname === '/Attendance' ? styles.active : ''}`}>
                  <FiCalendar className={styles.sidebarIcon} />
                  <span>Attendance</span>
                </a>
              </Link>
            </li>
          )}
          <li className={styles.sidebarItem}>
            <Link href="/Requirements" legacyBehavior>
              <a className={`${styles.sidebarLink} ${router.pathname === '/Requirements' ? styles.active : ''}`}>
                <FiClipboard className={styles.sidebarIcon} />
                <span>Daily Requirements</span>
              </a>
            </Link>
          </li>
          <li className={styles.sidebarItem}>
            <Link href="/Complaints" legacyBehavior>
              <a className={`${styles.sidebarLink} ${router.pathname === '/Complaints' ? styles.active : ''}`}>
                <FiClipboard className={styles.sidebarIcon} />
                <span>Complaints</span>
              </a>
            </Link>
          </li>
          <li className={styles.sidebarItem}>
            <Link href="/DailyPricing" legacyBehavior>
              <a className={`${styles.sidebarLink} ${router.pathname === '/DailyPricing' ? styles.active : ''}`}>
                <FiDollarSign className={styles.sidebarIcon} />
                <span>Daily Pricing</span>
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
            <Link href="/Employeelist" legacyBehavior>
              <a className={`${styles.sidebarLink} ${router.pathname === '/Employeelist' ? styles.active : ''}`}>
                <FiUser className={styles.sidebarIcon} />
                <span>Employee List</span>
              </a>
            </Link>
          </li>
          {role === 'ADMIN' && (
            <li className={styles.sidebarItem}>
              <Link href="/Settings" legacyBehavior>
                <a className={`${styles.sidebarLink} ${router.pathname === '/Settings' ? styles.active : ''}`}>
                  <FiSettings className={styles.sidebarIcon} />
                  <span>Settings</span>
                </a>
              </Link>
            </li>
          )}
        </ul>
      </div>
      <div className={styles.sidebarFooter}>
        <button className={styles.logoutButton} onClick={handleLogout}>
          <FiLogOut className={styles.sidebarIcon} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
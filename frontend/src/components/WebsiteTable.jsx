import { useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";
import Card from "./ui/Card.jsx";
import Button from "./ui/Button.jsx";
import Badge from "./ui/Badge.jsx";
import Input from "./ui/Input.jsx";
import { formatRelative, avatarFor, getDomain } from "../lib/format.js";

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const SortArrow = ({ direction }) => (
  <span className="ml-1 inline-block text-gray-500">
    {direction === "asc" ? "▲" : "▼"}
  </span>
);

const StatusBadge = ({ status, httpStatusCode }) => {
  const isUp = String(status).toLowerCase() === "up";
  const isDown = String(status).toLowerCase() === "down";
  const label = isUp
    ? `Up${httpStatusCode ? ` · ${httpStatusCode}` : ""}`
    : isDown
      ? `Down${httpStatusCode ? ` · ${httpStatusCode}` : ""}`
      : String(status);

  return (
    <Badge variant={isUp ? "success" : isDown ? "danger" : "neutral"}>
      {label}
    </Badge>
  );
};

const Favicon = ({ url }) => {
  const { letter, color } = avatarFor(url);
  return (
    <div
      className={`h-6 w-6 rounded flex items-center justify-center text-xs font-semibold ${color}`}
      aria-hidden="true"
    >
      {letter}
    </div>
  );
};

const WebsiteTable = ({ refreshKey = 0 }) => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "url",
    direction: "asc",
  });
  const [checkingIds, setCheckingIds] = useState(new Set());
  const websitesPerPage = 5;

  useEffect(() => {
    let cancelled = false;
    const fetchWebsites = async () => {
      setLoading(true);
      try {
        const response = await api.get("/api/websites");
        if (!cancelled) setWebsites(response.data);
      } catch (error) {
        console.error("Error fetching websites:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchWebsites();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const filteredWebsites = useMemo(() => {
    const filtered = websites.filter((w) =>
      w.url.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const sorted = [...filtered].sort((a, b) => {
      const { key, direction } = sortConfig;
      const mul = direction === "asc" ? 1 : -1;
      if (key === "lastChecked") {
        return (new Date(a[key]) - new Date(b[key])) * mul;
      }
      return String(a[key]).localeCompare(String(b[key])) * mul;
    });
    return sorted;
  }, [websites, searchTerm, sortConfig]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredWebsites.length / websitesPerPage)
  );
  const safePage = Math.min(currentPage, totalPages);
  const displayedWebsites = filteredWebsites.slice(
    (safePage - 1) * websitesPerPage,
    safePage * websitesPerPage
  );

  const handleCheckStatus = async (id, url) => {
    setCheckingIds((prev) => new Set(prev).add(id));
    try {
      const response = await api.post("/api/websites/check-status", {
        id,
        url,
      });
      const { status, httpStatusCode } = response.data;
      setWebsites((prev) =>
        prev.map((w) =>
          w.id === id
            ? {
                ...w,
                status,
                httpStatusCode: httpStatusCode ?? w.httpStatusCode,
                lastChecked: new Date().toISOString(),
              }
            : w
        )
      );
    } catch (error) {
      console.error("Error checking status:", error);
      alert("Failed to check website status. Please try again.");
    } finally {
      setCheckingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const SortableHeader = ({ label, sortKey, className = "" }) => (
    <th
      scope="col"
      onClick={() => handleSort(sortKey)}
      className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 cursor-pointer select-none hover:text-gray-200 ${className}`}
    >
      {label}
      {sortConfig.key === sortKey && (
        <SortArrow direction={sortConfig.direction} />
      )}
    </th>
  );

  return (
    <Card>
      <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-100">
            Monitored websites
          </h2>
          <p className="text-sm text-gray-400">
            {loading
              ? "Loading..."
              : `${filteredWebsites.length} site${
                  filteredWebsites.length === 1 ? "" : "s"
                }`}
          </p>
        </div>
        <div className="w-full sm:w-72">
          <Input
            icon={<SearchIcon />}
            type="search"
            placeholder="Search by URL"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-800/60">
            <tr>
              <SortableHeader label="Website" sortKey="url" />
              <SortableHeader label="Status" sortKey="status" />
              <SortableHeader label="Last Checked" sortKey="lastChecked" />
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-900">
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-sm text-gray-400"
                >
                  Loading websites...
                </td>
              </tr>
            ) : displayedWebsites.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="mx-auto max-w-xs">
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M2 12h20" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-100">
                      {searchTerm
                        ? "No matching websites"
                        : "No websites added yet"}
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      {searchTerm
                        ? "Try a different search term."
                        : "Add your first URL above to start monitoring."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              displayedWebsites.map((website) => {
                const isChecking = checkingIds.has(website.id);
                return (
                  <tr
                    key={website.id}
                    className="transition-colors hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <Favicon url={website.url} />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-100 truncate max-w-[22rem]">
                            {getDomain(website.url) || website.url}
                          </div>
                          <div className="text-xs text-gray-400 truncate max-w-[22rem]">
                            {website.url}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge
                        status={website.status}
                        httpStatusCode={website.httpStatusCode}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatRelative(website.lastChecked)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() =>
                            handleCheckStatus(website.id, website.url)
                          }
                          disabled={isChecking}
                        >
                          {isChecking ? "Checking..." : "Check Status"}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            window.open(website.url, "_blank", "noopener")
                          }
                        >
                          Visit
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && filteredWebsites.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800 text-sm text-gray-400">
          <span>
            Page <span className="font-medium text-gray-100">{safePage}</span>{" "}
            of <span className="font-medium text-gray-100">{totalPages}</span>
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default WebsiteTable;

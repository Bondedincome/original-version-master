import React, { useState, useEffect } from "react";
import { getBaseUrl } from "../../../Utils/baseApi";
import { Edit, Trash2 } from "lucide-react";

const API_URL = getBaseUrl() + "/api/customers";

const Customers = () => {
	const [customers, setCustomers] = useState([]);
	const [newCustomer, setNewCustomer] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [editId, setEditId] = useState(null);
	const [editCustomer, setEditCustomer] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
	});

	// Fetch customers from API
	useEffect(() => {
		const fetchCustomers = async () => {
			setLoading(true);
			setError("");
			try {
				const token = localStorage.getItem("token");
				const res = await fetch(API_URL, {
					headers: token ? { Authorization: `Bearer ${token}` } : {},
				});
				if (!res.ok) throw new Error("Failed to fetch customers");
				const data = await res.json();
				setCustomers((data.customers || data).filter((c) => !c.isDeleted));
			} catch {
				setError("Could not load customers.");
			} finally {
				setLoading(false);
			}
		};
		fetchCustomers();
	}, []);

	const handleChange = (e) => {
		setNewCustomer({ ...newCustomer, [e.target.name]: e.target.value });
	};

	const handleAddCustomer = async (e) => {
		e.preventDefault();
		if (
			!newCustomer.firstName ||
			!newCustomer.lastName ||
			!newCustomer.email ||
			!newCustomer.phone
		)
			return;

		setLoading(true);
		setError("");
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(API_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify(newCustomer),
			});
			if (!res.ok) throw new Error("Failed to add customer");
			const added = await res.json();
			setCustomers([...customers, added.customer || added]);
			setNewCustomer({
				firstName: "",
				lastName: "",
				email: "",
				phone: "",
			});
		} catch {
			setError("Could not add customer.");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (customerId) => {
		setLoading(true);
		setError("");
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_URL}/${customerId}`, {
				method: "DELETE",
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			});
			if (!res.ok) {
				const errText = await res.text();
				console.error("Delete failed:", errText);
				throw new Error("Failed to delete customer");
			}
			setCustomers(customers.filter((c) => c.customerId !== customerId));
		} catch {
			setError("Could not delete customer.");
		} finally {
			setLoading(false);
		}
	};

	const handleEditClick = (customer) => {
		setEditId(customer.customerId);
		setEditCustomer({
			firstName: customer.firstName,
			lastName: customer.lastName,
			email: customer.email,
			phone: customer.phone,
		});
	};

	const handleEditChange = (e) => {
		setEditCustomer({ ...editCustomer, [e.target.name]: e.target.value });
	};

	const handleEditSave = async (id) => {
		setLoading(true);
		setError("");
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_URL}/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify(editCustomer),
			});
			if (!res.ok) throw new Error("Failed to update customer");
			const updated = await res.json();
			setCustomers((prev) =>
				prev.map((c) => (c.customerId === id ? updated.customer || updated : c))
			);
			setEditId(null);
		} catch {
			setError("Could not update customer.");
		} finally {
			setLoading(false);
		}
	};

	const handleEditCancel = () => {
		setEditId(null);
	};

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold text-gray-900">
				Customer Management
			</h1>
			<div className="bg-white rounded-xl shadow-lg p-6">
				{error && (
					<div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
						{error}
					</div>
				)}
				<form onSubmit={handleAddCustomer} className="mb-6 space-y-4">
					<div className="flex flex-col md:flex-row gap-4 flex-wrap">
						<input
							type="text"
							name="firstName"
							value={newCustomer.firstName}
							onChange={handleChange}
							placeholder="First Name"
							className="border px-3 py-2 rounded-lg flex-1"
							required
						/>
						<input
							type="text"
							name="lastName"
							value={newCustomer.lastName}
							onChange={handleChange}
							placeholder="Last Name"
							className="border px-3 py-2 rounded-lg flex-1"
							required
						/>
						<input
							type="email"
							name="email"
							value={newCustomer.email}
							onChange={handleChange}
							placeholder="Email"
							className="border px-3 py-2 rounded-lg flex-1"
							required
						/>
						<input
							type="text"
							name="phone"
							value={newCustomer.phone}
							onChange={handleChange}
							placeholder="Phone"
							className="border px-3 py-2 rounded-lg flex-1"
							required
						/>
						<button
							type="submit"
							className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
							disabled={loading}
						>
							{loading ? "Processing..." : "Add"}
						</button>
					</div>
				</form>
				{loading ? (
					<div className="text-center text-gray-500 py-4">Loading...</div>
				) : (
					<table className="w-full text-left">
						<thead>
							<tr>
								<th className="py-2">Name</th>
								<th className="py-2">Email</th>
								<th className="py-2">Phone</th>
								<th className="py-2">Actions</th>
							</tr>
						</thead>
						<tbody>
							{customers.map((customer) => (
								<tr key={customer.customerId} className="border-t">
									{editId === customer.customerId ? (
										<>
											<td className="py-2">
												<input
													type="text"
													name="firstName"
													value={editCustomer.firstName}
													onChange={handleEditChange}
													className="border px-2 py-1 rounded"
												/>
											</td>
											<td className="py-2">
												<input
													type="email"
													name="email"
													value={editCustomer.email}
													onChange={handleEditChange}
													className="border px-2 py-1 rounded"
													readOnly
												/>
											</td>
											<td className="py-2">
												<input
													type="text"
													name="phone"
													value={editCustomer.phone}
													onChange={handleEditChange}
													className="border px-2 py-1 rounded"
												/>
											</td>
											<td className="py-2">
												<div className="flex items-center space-x-2">
													<button
														onClick={() => handleEditSave(customer.customerId)}
														className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
														disabled={loading}
													>
														Save
													</button>
													<button
														onClick={handleEditCancel}
														className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500"
														disabled={loading}
													>
														Cancel
													</button>
												</div>
											</td>
										</>
									) : (
										<>
											<td className="py-2">
												{customer.firstName} {customer.lastName}
											</td>
											<td className="py-2">{customer.email}</td>
											<td className="py-2">{customer.phone}</td>
											<td className="py-2">
												<div className="flex items-center space-x-2">
													<button
														onClick={() => handleEditClick(customer)}
														className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
														disabled={loading}
													>
														<Edit className="w-4 h-4" />
													</button>
													<button
														onClick={() => handleDelete(customer.customerId)}
														className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
														disabled={loading}
													>
														<Trash2 className="w-4 h-4" />
													</button>
												</div>
											</td>
										</>
									)}
								</tr>
							))}
							{customers.length === 0 && !loading && (
								<tr>
									<td colSpan={4} className="text-center text-gray-500 py-4">
										No customers found.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
};

export default Customers;

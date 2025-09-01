import axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import { Button, Carousel, Col, Container, Form, Image, Modal, Row, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom"
import { AuthContext } from "../AuthContext";
import { deleteObject, getDownloadURL, getMetadata, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";



export default function CarlistSinglePost() {
    const { uid, id } = useParams();
    const { url } = useContext(AuthContext);
    const [carDetail, setCarDetail] = useState({ image_urls: [] });
    const [preview, setPreview] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [displayName, setDisplayName] = useState("");
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [descriptions, setDescriptions] = useState("");
    const [conditions, setConditions] = useState("");
    const [year, setYear] = useState("");
    const [color, setColor] = useState("");
    const [mileage, setMileage] = useState("");
    const [price, setPrice] = useState("");
    const [images, setImages] = useState([]);
    const [files, setFiles] = useState([])
    const [editModal, setEditModal] = useState(false);
    const [favourite, setFavourite] = useState([]);
    const navigate = useNavigate();

    const handleShowPreview = (image) => {
        setPreview(true);
        setPreviewImage(image);
    }

    const handleClosePreview = () => {
        setPreview(false);
        setPreviewImage(null);
    }

    const handleShowEditModal = () => {
        setEditModal(true);
        setDisplayName(carDetail.display_name);
        setBrand(carDetail.brand);
        setModel(carDetail.model);
        setDescriptions(carDetail.descriptions);
        setConditions(carDetail.conditions);
        setYear(carDetail.year);
        setColor(carDetail.color);
        setMileage(carDetail.mileage);
        setPrice(carDetail.price);
        setImages(carDetail.image_urls);
    }

    const handleCloseEditModal = () => {
        setEditModal(false);
        setDisplayName("");
        setDescriptions("");
        setConditions("");
        setYear("");
        setColor("");
        setMileage("");
        setPrice("");
        setImages([]);
        setFiles([]);
    }

    const fetchSingleCarlist = useCallback(async () => {
        const response = await axios.get(`${url}/carlist/${uid}/${id}`);
        console.log(response);
        setCarDetail(response.data.rows[0]);

    }, [uid, id])

    useEffect(() => {
        setImages(carDetail.image_urls || []);
    }, [carDetail])

    const handleFileChange = (e) => {
        setFiles([]);
        for (let i = 0; i < e.target.files.length; i++) {
            const newFile = e.target.files[i];
            setFiles((file) => [...file, newFile])
        };
    }

    const updateCar = async () => {
        try {
            let imageRefs = [];
            let imageUrls = [];

            if (files && files.length > 0) {
                imageUrls = await Promise.all(
                    files.map(async (file) => {
                        const uniqueFileName = `${file.lastModified}-${uid}-${file.name}`
                        const imageRef = ref(storage, `vehicles/${brand}/${model}/${uniqueFileName}`);
                        imageRefs = [...imageRefs, imageRef];
                        const response = await uploadBytes(imageRef, file);
                        const imageUrl = await getDownloadURL(response.ref);
                        return imageUrl;
                    })
                );
            } else {
                imageUrls = undefined;
            }

            const data = {
                displayName,
                descriptions,
                conditions,
                year,
                color,
                mileage,
                price,
                ...(imageUrls && { imageUrls }),
            };

            try {
                await axios.put(`${url}/carlist/${uid}/${id}`, data);
                alert("Vehicle Posted Successful");
                fetchSingleCarlist();
                handleCloseEditModal();
            } catch (apiError) {
                if (imageRefs.length > 0) {
                    try {
                        await Promise.all(imageRefs.map((ref) => deleteObject(ref)));
                        console.warn("Uploaded images rollback")
                    } catch (deleteError) {
                        console.error("Failed to delete uploaded images:", deleteError)
                    }
                }
                console.error("Failed to upload vehicels data:", apiError);
            }
        }
        catch (storageError) {
            console.error("Failed to upload vehicels image:", storageError);
        }
    }

    const deleteExistingImage = async (image) => {
        const pathname = new URL(image).pathname;
        const splittedFilePath = pathname.split("/").pop();
        const decodedFilePath = decodeURIComponent(splittedFilePath).split("/");
        console.log(decodedFilePath);
        const imageRef = ref(storage, `${decodedFilePath[0]}/${decodedFilePath[1]}/${decodedFilePath[2]}/${decodedFilePath[3]}`);
        try {
            await axios.put(`${url}/carlist/car_image/${uid}/${id}`, { image });
            try {
                // Remove image from firebase
                const firebaseImageExist = await getMetadata(imageRef);
                console.log(firebaseImageExist);
                if (firebaseImageExist) {
                    await deleteObject(imageRef);
                    console.log(imageRef, "From Firebase Delete Successfully");
                }
            } catch (firebaseDeleteError) {
                console.error("Failed to delete image from firebase,", firebaseDeleteError);
            }
            fetchSingleCarlist();
            window.alert("Image Delete Successful");
        } catch (deleteError) {
            console.error("Failed to delete selected image,", deleteError);
        }
    };

    const deletePost = async () => {
        try {
            await axios.delete(`${url}/carlist/${uid}/${id}`);
            let imageRefArray = [];
            if (images.length > 0) {
                imageRefArray = await Promise.all(
                    images.map((image) => {
                        const pathname = new URL(image).pathname;
                        const splittedFilePath = pathname.split("/").pop();
                        const decodedFilePath = decodeURIComponent(splittedFilePath).split("/");
                        const imageRef = ref(storage, `${decodedFilePath[0]}/${decodedFilePath[1]}/${decodedFilePath[2]}/${decodedFilePath[3]}`);
                        return imageRef;
                    })
                )
            };
            window.alert("Carlist delete successfully");
            navigate(`/postpage/${uid}`);
            if (imageRefArray.length > 0) {
                try {
                    Promise.all(imageRefArray.map((imageRef) => deleteObject(imageRef)));
                    console.log("Firebase Images delete successfully.");
                } catch (firebaseError) {
                    console.error("Failed to delete firebase images,", firebaseError);
                }
            };
        } catch (apiError) {
            console.error("Failed to delete carlist post,", apiError);
        }
    };

    const fetchFavourite = async () => {
        try {
            const result = await axios.get(`${url}/favourite/car/${id}`);
            console.log(result.data.rows);
            setFavourite(result.data.rows);
        } catch (apiError) {
            console.error("Error: ", apiError);
        }
    };

    useEffect(() => {
        fetchSingleCarlist();
        fetchFavourite();
    }, [])

    useEffect(() => {
        console.log(favourite);
    }, [favourite])

    return (
        <>
            <Container className="my-4">
                <Row>
                    <Col
                        sm={6}
                        className="mb-3"
                        style={{ overflow: "hidden" }}
                    >
                        {carDetail.image_urls.length > 0 ? (
                            <Carousel
                                className="d-flex align-items-center justify-content-center"
                            >
                                {carDetail.image_urls.map((image) => (
                                    <Carousel.Item
                                        style={{ height: "25rem", justifyItems: "center" }}
                                        key={image}
                                    >
                                        <Image
                                            fluid
                                            style={{ height: "100%", objectFit: "contain", cursor: "pointer" }}
                                            onClick={() => handleShowPreview(image)}
                                            src={image}
                                        />
                                    </Carousel.Item>
                                ))}
                            </Carousel>
                        ) : (
                            <div style={{ height: "25rem" }}>
                                <Image
                                    fluid
                                    style={{ height: "100%", objectFit: "contain", cursor: "pointer" }}
                                    src="/no_image.jpg"
                                />
                            </div>
                        )}
                        <div className="mt-3">
                            <Button
                                variant="danger"
                                // style={{ width: "3rem" }}
                                // onClick={handleShowEditModal}
                                disabled
                            >
                                <i
                                    className={favourite?.length > 0 ? "bi bi-heart-fill me-1" : "bi bi-heart me-1"}
                                >
                                </i>
                                {favourite?.length}
                            </Button>
                            <Button
                                variant="secondary"
                                className="ms-2"
                                onClick={handleShowEditModal}
                            >
                                Edit Post
                            </Button>
                            <Button
                                variant="danger"
                                className="ms-2"
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to delete this carlist?")) {
                                        deletePost();
                                    }
                                }}
                            >
                                Delete Post
                            </Button>
                        </div>
                    </Col>

                    <Col sm={6}>
                        <Container>
                            <Form>
                                <Form.Group as={Row} className="mb-2" controlId="displayName">
                                    <Col xs={2} className="d-flex flex-col items-align-end">
                                        <Form.Label size="sm" className="fw-bold">Car</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            value={carDetail.display_name || ""}
                                            type="text"
                                            disabled
                                        />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-2" controlId="brand">
                                    <Col xs={2} className="d-flex items-align center">
                                        <Form.Label className="fw-bold">Brand</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            value={carDetail.brand || ""}
                                            disabled
                                        />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-2" controlId="model">
                                    <Col xs={2} className="d-flex items-align center">
                                        <Form.Label className="fw-bold">Model</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            value={carDetail.model || ""}
                                            disabled
                                        />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-2" controlId="conditions">
                                    <Col xs={2} className="d-flex items-align center">
                                        <Form.Label className="fw-bold">Conditions</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            value={carDetail.conditions || ""}
                                            disabled
                                        />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-2" controlId="year">
                                    <Col xs={2} className="d-flex items-align center">
                                        <Form.Label className="fw-bold">Year</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            value={carDetail.year || ""}
                                            disabled
                                        />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-2" controlId="color">
                                    <Col xs={2} className="d-flex items-align center">
                                        <Form.Label className="fw-bold">Color</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            value={carDetail.color || ""}
                                            disabled
                                        />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-2" controlId="mileage">
                                    <Col xs={2} className="d-flex items-align center">
                                        <Form.Label className="fw-bold">Mileage</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            value={carDetail.mileage || ""}
                                            disabled
                                        />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-2" controlId="price">
                                    <Col xs={2} className="d-flex items-align center">
                                        <Form.Label className="fw-bold">Price</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            value={carDetail.price || ""}
                                            disabled
                                        />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-2" controlId="descriptions">
                                    <Col xs={2} className="d-flex items-align center">
                                        <Form.Label className="fw-bold">Descriptions</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            as="textarea"
                                            value={carDetail.descriptions || ""}
                                            rows={8}
                                            disabled
                                        />
                                    </Col>
                                </Form.Group>

                            </Form>
                        </Container>
                    </Col>
                </Row>
            </Container>

            {/* Image Preview Modal */}
            <Modal
                show={preview}
                onHide={handleClosePreview}
                size="lg"
                centered
            >
                <Modal.Body className="text-center p-0">
                    <Image
                        src={previewImage}
                        fluid
                        style={{ maxHeight: "90vh", objectFit: "contain" }}
                    />
                </Modal.Body>
            </Modal>

            {/* Carlist Edit Modal */}
            <Modal
                size="lg"
                show={editModal}
                onHide={handleCloseEditModal}
            >
                <Modal.Header closeButton>Edit Carlist</Modal.Header>
                <Modal.Body>
                    <Container>
                        <Form>
                            <Form.Group as={Row} className="mb-2" controlId="displayName">
                                <Col xs={2} className="d-flex flex-col items-align-end">
                                    <Form.Label size="sm" className="fw-bold">Car</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        type="text"
                                        placeholder="Vehicle Name"
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="brand">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Brand</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        value={brand}
                                        disabled
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="model">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Model</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        value={model}
                                        disabled
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="conditions">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Conditions</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        as="select"
                                        value={conditions}
                                        onChange={(e) => setConditions(e.target.value)}
                                        required
                                    >
                                        <option value="New">New</option>
                                        <option value="Used">Used</option>
                                        <option value="Recon">Recon</option>
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="year">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Year</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="number"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        placeholder="Vehicle Year"
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="color">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Color</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        placeholder="Vehicle Color"
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="mileage">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Mileage</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        as="select"
                                        value={mileage}
                                        onChange={(e) => setMileage(e.target.value)}
                                        required
                                    >
                                        <option value="0KM - 100KM">0KM - 100KM</option>
                                        <option value="101KM - 30,000KM">101KM - 30,000KM</option>
                                        <option value="30,001KM - 60,000KM">30,001KM - 60,000KM</option>
                                        <option value="30,001KM - 100,000KM">30,001KM - 100,000KM</option>
                                        <option value="100,001KM And Above">100,001KM And Above</option>
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="descriptions">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Descriptions</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        value={descriptions}
                                        onChange={(e) => setDescriptions(e.target.value)}
                                        as="textarea"
                                        placeholder="Specification or condition additional detail"
                                        rows={4}
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="price">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Price</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="Vehicle Price (RM30,000)"
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="file">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="text-center fw-bold">Images</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        className="mb-3"
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                    />
                                    <Row>
                                        {images.length > 0 && images.map((image) => {
                                            const pathname = new URL(image).pathname;
                                            const encodedFullName = pathname.split("/").pop();
                                            const encodedFileName = encodedFullName.substring(encodedFullName.indexOf("-") + 1);
                                            const fileName = decodeURIComponent(encodedFileName);
                                            const shortName = fileName.substring(fileName.length - 10)
                                            return <p
                                                key={image}
                                                className="border me-1"
                                                style={{
                                                    borderRadius: "5px",
                                                    width: "9rem"
                                                }}
                                            >
                                                ...{shortName}<i
                                                    onClick={() => {
                                                        if (window.confirm("Are you sure you want to delete this image?")) {
                                                            deleteExistingImage(image);
                                                        }
                                                    }}
                                                    className="bi bi-trash ms-1"
                                                    style={{ cursor: "pointer" }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.color = "red")}
                                                    onMouseLeave={(e) => (e.currentTarget.style.color = "black")}
                                                >
                                                </i>
                                            </p>
                                        })}
                                    </Row>
                                </Col>
                            </Form.Group>
                        </Form>
                    </Container>
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={updateCar}>Update</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
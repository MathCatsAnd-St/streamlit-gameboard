import setuptools

setuptools.setup(
    name="streamlit-gameboard",
    version="0.0.1",
    author="MathCatsAnd",
    author_email="opensource@mathcatsand.com",
    description="a gameboard for use with streamlit",
    long_description="",
    long_description_content_type="text/plain",
    url="",
    packages=setuptools.find_packages(),
    include_package_data=True,
    classifiers=[],
    python_requires=">=3.8",
    install_requires=[
        "streamlit >= 1.16.0",
        "numpy >= 1.24.0",
    ],
)

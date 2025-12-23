"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisionAdapter = void 0;
const vision_1 = require("@google-cloud/vision");
const visionClient = new vision_1.ImageAnnotatorClient();
class VisionAdapter {
    constructor() {
        this.endpoint = "https://vision.googleapis.com/v1/images:annotate";
        this.method = "POST";
        this.sourceAuthority = "ComplianceDesk Vision Engine";
    }
    buildRequest(inputs) {
        return {
            image: { content: inputs.imageBase64 },
            features: [{ type: "TEXT_DETECTION" }]
        };
    }
    async verify(inputs) {
        try {
            const [result] = await visionClient.textDetection({
                image: { content: inputs.imageBase64 }
            });
            return this.normalizeResponse(result);
        }
        catch (error) {
            return {
                isValid: false,
                rawResponse: error.message,
                error: "Vision AI Analysis Failed"
            };
        }
    }
    normalizeResponse(apiResponse) {
        const fullText = apiResponse.fullTextAnnotation?.text || "";
        let totalConfidence = 0;
        let symbolCount = 0;
        apiResponse.fullTextAnnotation?.pages?.forEach((page) => {
            page.blocks?.forEach((block) => {
                block.paragraphs?.forEach((para) => {
                    para.words?.forEach((word) => {
                        word.symbols?.forEach((symbol) => {
                            totalConfidence += symbol.confidence || 0;
                            symbolCount++;
                        });
                    });
                });
            });
        });
        const averageConfidence = symbolCount > 0 ? totalConfidence / symbolCount : 0;
        const isLowConfidence = averageConfidence < 0.7;
        return {
            isValid: fullText.length > 10,
            legalName: "OCR EXTRACTED",
            rawResponse: apiResponse,
            error: isLowConfidence ? "Low Confidence: Blurry ID detected (Explainable AI)" : undefined
        };
    }
}
exports.VisionAdapter = VisionAdapter;
//# sourceMappingURL=vision-adapter.js.map
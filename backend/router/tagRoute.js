const express = require('express')
const {openRouterSuggest, localSuggestTags} = require('../middleware/taggenerator')

const router = express.Router()

router.post("/tags", async (req, res) => {
    try{
        const {title, description} = req.body;
        const product = {title: title || "", description: description || ""}

        try {
            const out = await openRouterSuggest(product)
            return res.json({source: "openrouter-ai", ...out})
        } catch (error) {
            console.warn("OpenRouter Failed, falling back to local suggest:", error.message)
            const out = localSuggestTags(product)
            return res.json({source: "local-suggest", ...out})
        }
    }catch (error){
        res.status(500).json({error: error.message})
    }
})

module.exports = router;